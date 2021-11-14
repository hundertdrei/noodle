#!/usr/bin/env python3

import argparse
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
import json
from datetime import *

# Convert data from old Noodle
#
# Usage:
# * Obtain phpMyAdmin JSON dump of database
# * Run the script (don't forget to pass the admin secret or set liberal Hasura permissions during the conversion)

DEFAULT_URL = "http://localhost:7070/v1/graphql"

parser = argparse.ArgumentParser(description='Convert "classic" Noodle attendance to new format')
parser.add_argument('input', metavar='JSON', nargs=1, help='phpMyAdmin JSON export of attendance data')
parser.add_argument('--url', '-U', metavar='URL', default=DEFAULT_URL, help="Hasura URL (default: %(default)s)")
parser.add_argument('--secret', '-S', metavar='SECRET', help="Hasura admin secret")
args = parser.parse_args()

classic_db = json.load(open(args.input[0], "r"))

#
# Extract the raw table data
#

# Attendance fields:
#  ID: not really relevant
#  user: Name of the user attendance is recorded for
#  date: date of attendance
#  tid: Training ID
#  type: Type of attendance (yes/no/maybe, though 'maybe' isn't used any more)
raw_classic_attendance = None
# Semester fields:
#  ID: used in trainings
#  title: Title/Description
#  from: Start date (YYYY-MM-DD)
#  to: End date (YYYY-MM-DD)
raw_classic_semester = None
# Training fields:
#  ID: used in attendance
#  day: day of week (starting from 1 = Monday)
#  semesterID: semester training belongs to
#  from: start time (24h local time)
#  to: end time (24h local time)
#  title: Title/Description
raw_classic_training = None
# User fields:
#  name: Name of user (also serves as ID!)
#  attributes: JSON string with some "attributes" (typically team affinities)
#  trainings: JSON with per-training attendance info - probably not relevant
raw_classic_user = None

for db_data in classic_db:
    if db_data["type"] != "table": continue
    table_name = db_data["name"]
    vars()["raw_classic_" + table_name] = db_data["data"]

#
# Convert data into new structure
#

def filter_title(s: str):
    # Remove soft hyphen in titles
    return s.replace("\u00ad", "")

# Course: Assemble from semester + training data
semester_age_cutoff = timedelta(weeks=52)
semester_end_date_cutoff = datetime.today() - semester_age_cutoff # Skip all semesters that ended before this date

class Course:
    def __init__(self):
        self.title = None
        self.date_begin = None
        self.date_end = None
        self.time_begin = None
        self.time_end = None
        self.day_of_week = None
        self.location = None

    def __str__(self):
        # Debugging: String representation
        return str(self.__dict__)

# Map: semester ID -> Course object (partially filled)
semester_to_course = {}
for raw_sem in raw_classic_semester:
    sem_end = datetime.fromisoformat(raw_sem["to"])
    if sem_end < semester_end_date_cutoff: continue
    course = Course()
    course.title = filter_title(raw_sem["title"])
    course.date_begin = datetime.fromisoformat(raw_sem["from"])
    course.date_end = sem_end
    semester_to_course[raw_sem["ID"]] = course

# Map: training ID -> Course object (complete)
training_to_new_course = {}
for raw_training in raw_classic_training:
    sem_id = raw_training["semesterID"]
    course_template = semester_to_course.get(sem_id)
    if not course_template: continue
    new_course = Course()
    new_course.title = "{} {}".format(filter_title(raw_training["title"]), course_template.title)
    new_course.date_begin = course_template.date_begin
    new_course.date_end = course_template.date_end
    new_course.time_begin = time.fromisoformat(raw_training["from"])
    new_course.time_end = time.fromisoformat(raw_training["to"])
    new_course.day_of_week = int(raw_training["day"])
    new_course.location = "" # unknown...
    training_to_new_course[raw_training["ID"]] = new_course

# Training: Synthesize from course data
class Training:
    def __init__(self):
        self.course = None # Course object
        self.date = None # Training data

    def __str__(self):
        # Debugging: String representation
        return str(self.__dict__)

# Map: (training ID, date) -> Training object
trainings = {}
for training_id, course in training_to_new_course.items():
    current_date = course.date_begin
    # Find next date after 'current_date' that's on the course day of week
    current_iso_year, current_iso_week, current_iso_day = current_date.isocalendar()
    if current_iso_day > course.day_of_week:
        current_iso_week += 1 # Begin date day is after day of week, adjust week forward
    current_iso_day = course.day_of_week
    current_date = datetime.fromisocalendar(current_iso_year, current_iso_week, current_iso_day)
    while current_date <= course.date_end:
        new_training = Training()
        new_training.course = course
        new_training.date = current_date
        training_key = (training_id, current_date.date().isoformat())
        trainings[training_key] = new_training
        current_date += timedelta(weeks=1)

# Collect attendance
# Map: player name -> list of tuples: (training object, attending)
attendances = {}
for raw_attendance in raw_classic_attendance:
    training_id = raw_attendance["tid"]
    # Check if training/semester was filtered out earlier
    if not training_id in training_to_new_course: continue
    training_key = (training_id, raw_attendance["date"])
    training_obj = trainings.get(training_key)
    assert(training_obj)
    attending = raw_attendance["type"] == "yes"
    player = raw_attendance["user"].strip()
    player_attendances = attendances.setdefault(player, [])
    player_attendances.append((training_obj, attending))

#
# Storing new data
#

# Set up GraphQL connection
http_headers = {}
http_headers["content-type"] = "application/json"
if args.secret:
    http_headers["x-hasura-admin-secret"] = args.secret

gql_transport = RequestsHTTPTransport(url=args.url, headers=http_headers)
gql_client = Client(transport=gql_transport, fetch_schema_from_transport=True)

# Map: player name -> player_id
player_name_to_id = {}
# Make sure each player is registered
query_find_player = gql("""
    query MyQuery($name: String) {
        dim_player(where: {name: {_eq: $name}}) {
            player_id
        }
    }
""")
query_add_player = gql("""
    mutation ($object: dim_player_insert_input!) {
        player: insert_dim_player_one (
            object: $object,
            on_conflict: {
            constraint: dim_player_pkey,
            update_columns: [name]
            }
        ) {
            name
            player_id
        }
    }
""")
for player_name in attendances.keys():
    player_id = None
    try:
        result = gql_client.execute(query_find_player, variable_values={"name": player_name})
        dim_player_result = result['dim_player']
        if len(dim_player_result) == 0:
            # Add new player
            result = gql_client.execute(query_add_player, variable_values={"object": {"name": player_name}})
            player_result = result['player']
        else:
            player_result = dim_player_result[0]
        player_id = player_result['player_id']
    except Exception as e:
        print(f"Error adding player {player_name}: {e}")
    player_name_to_id[player_name] = player_id

# Create courses
query_add_course = gql("""
    mutation ($object: dim_course_insert_input! ) {
        course: insert_dim_course_one (
            object: $object,
            on_conflict: {
                constraint: dim_course_pkey,
                update_columns: [title, title_short, date_begin, date_end, time_begin, time_end, location, comment, day_of_week]
            }
        ) {
            courseId: course_id
            title
            titleShort: title_short
            location
            timeBegin: time_begin
            timeEnd: time_end
            dateBegin: date_begin
            dateEnd: date_end
            dayOfWeek: day_of_week
            comment,
            trainings: dim_trainings {
                trainingDate: training_date
                courseId: course_id
                trainingId: training_id
                timeBegin: time_begin
                timeEnd: time_end
                location
                comment
            }
        }
    }
""")
course_ids = {}
for course in training_to_new_course.values():
    course_data = {}
    course_data["title"] = course.title
    course_data["title_short"] = ""
    course_data["date_begin"] = course.date_begin.date().isoformat()
    course_data["date_end"] = course.date_end.date().isoformat()
    course_data["time_begin"] = course.time_begin.isoformat()
    course_data["time_end"] = course.time_end.isoformat()
    course_data["location"] = course.location
    course_data["comment"] = ""
    course_data["day_of_week"] = course.day_of_week
    result = gql_client.execute(query_add_course, variable_values={"object": course_data})
    course_ids[repr(course)] = result['course']['courseId']

# Create trainings
query_add_training = gql("""
    mutation ($object: dim_training_insert_input! ) {
        training: insert_dim_training_one(
            object: $object,
            on_conflict: {
                constraint: dim_training_pkey,
                update_columns: [course_id, training_date, comment, time_begin, time_end, location]
            }
        ) {
            trainingDate: training_date
            trainingId: training_id
            timeEnd: time_end
            timeBegin: time_begin
            location
            cancelled
            comment
            courseId: course_id
        }
    } 
""")
training_ids = {}
for training in trainings.values():
    training_data = {}
    training_data["course_id"] = course_ids[repr(training.course)]
    training_data["training_date"] = training.date.isoformat()
    result = gql_client.execute(query_add_training, variable_values={"object": training_data})
    training_ids[repr(training)] = result['training']['trainingId']

# Create attendance
query_add_attendance = gql("""
    mutation ( $playerId: Int, $trainingId: Int, $attend: Boolean ) {
        attendance: insert_fact_attendance(objects: {player_id: $playerId, training_id: $trainingId, attend: $attend}, on_conflict: {constraint: fact_attendance_pkey, update_columns: attend}) {
            returning {
                player: dim_player {
                    name
                    playerId: player_id
                }
                attend
                trainingId: training_id
            }
        }
    }
""")
for player, attendance_list in attendances.items():
    playerId = player_name_to_id[player]
    if not playerId: continue
    attendance_data = {}
    attendance_data["playerId"] = playerId
    for training_obj, attending in attendance_list:
        attendance_data["trainingId"] = training_ids[repr(training_obj)]
        attendance_data["attend"] = attending
        gql_client.execute(query_add_attendance, variable_values=attendance_data)
