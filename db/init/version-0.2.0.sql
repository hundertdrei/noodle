create table fact_season (
    season_id serial primary key,
    date date not null unique,
    name varchar(100) not null
);