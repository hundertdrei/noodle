create table dim_player (
    player_id serial primary key,
    name varchar(50) not null unique
);

create table dim_course (
    course_id serial primary key,
    title varchar(120) not null,
    title_short varchar(15) not null,
    date_begin date not null,
    date_end date not null,
    time_begin time not null,
    time_end time not null,
    day_of_week smallint not null,
    location varchar(30) not null,
    comment varchar(150) not null
);

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
