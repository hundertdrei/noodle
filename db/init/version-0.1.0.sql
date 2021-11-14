create table dim_player (
    player_id serial primary key,
    name varchar(50) not null unique
);

/* example values */
insert into dim_player values
 (1, 'Andreas'),
 (2, 'Johanna');


create table dim_course (
    course_id serial primary key,
    title varchar(140) not null,
    title_short varchar(15) not null,
    date_begin date not null,
    date_end date not null,
    time_begin time not null,
    time_end time not null,
    day_of_week smallint not null,
    location varchar(30) not null,
    comment varchar(150) not null
);

/* example values */

insert into dim_course values
(1, 'Anfängertraining A1 Sommersemester 2021', 'A1', '2021-04-01', '2021-07-31', '18:00', '20:00', 1, 'USV Oberaue 1', 'Scheibe mitbringen'),
(2, 'Freies Spiel Sommersemester 2021', 'FS', '2021-04-01', '2021-07-31', '18:30', '20:00', 0, 'USV Oberaue 1', 'Kein Training');

create table dim_training (
    training_id serial primary key,
    course_id int not null,
    training_date date not null,
    time_begin time default null,
    time_end time default null,
    location varchar(30) default null,
    comment varchar(150) default null,
    cancelled boolean default 'false',
    constraint fk_course
        foreign key(course_id) 
        references dim_course(course_id)
        on delete cascade
);

/* example values */
insert into dim_training (training_id, course_id, training_date) values
(1, 1, '2021-04-05'),
(2, 1, '2021-04-12'),
(3, 1, '2021-04-19'),
(4, 1, '2021-04-26'),
(5, 1, '2021-05-03'),
(6, 1, '2021-05-10'),
(7, 1, '2021-05-17'),
(8, 1, '2021-05-24'),
(9, 1, '2021-05-31'),
(10, 1, '2021-06-07'),
(11, 1, '2021-06-14'),
(12, 1, '2021-06-21'),
(13, 1, '2021-06-28'),
(14, 1, '2021-07-05'),
(15, 1, '2021-07-12'),
(16, 1, '2021-07-19'),
(17, 1, '2021-07-26'),
(18, 2, '2021-04-04'),
(19, 2, '2021-04-11'),
(20, 2, '2021-04-18'),
(21, 2, '2021-04-25'),
(22, 2, '2021-05-02'),
(23, 2, '2021-05-09'),
(24, 2, '2021-05-16'),
(25, 2, '2021-05-23'),
(26, 2, '2021-05-30'),
(27, 2, '2021-06-06'),
(28, 2, '2021-06-13'),
(29, 2, '2021-06-20'),
(30, 2, '2021-06-27'),
(31, 2, '2021-07-04'),
(32, 2, '2021-07-11'),
(33, 2, '2021-07-18'),
(34, 2, '2021-07-25');


create table fact_attendance (
    player_id int not null,
    training_id int not null,
    attend boolean default null,
    primary key (player_id, training_id),
    constraint fk_player
        foreign key(player_id) 
        references dim_player(player_id)
        on delete cascade,
    constraint fk_training
        foreign key(training_id) 
        references dim_training(training_id)
        on delete cascade
);

/* example values */
insert into fact_attendance values
(1, 10, 'true'),
(1, 11, 'true'),
(1, 12, 'true'),
(1, 13, 'true'),
(1, 14, 'false'),
(1, 15, 'true'),
(1, 16, 'true'),
(1, 28, 'true'),
(1, 29, 'true'),
(1, 30, 'true'),
(1, 33, 'true'),
(1, 34, 'false'),
(2, 10, 'true'),
(2, 11, 'false'),
(2, 12, 'true'),
(2, 13, 'true'),
(2, 16, 'false'),
(2, 17, 'true'),
(2, 27, 'true'),
(2, 28, 'true'),
(2, 29, 'false'),
(2, 30, 'true'),
(2, 31, 'false'),
(2, 32, 'true'),
(2, 33, 'true'),
(2, 34, 'true');