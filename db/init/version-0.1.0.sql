create table dim_player (
    player_id serial primary key,
    player_name varchar(40) not null
);

insert into dim_player values
 (1, 'Andreas'),
 (2, 'Johanna');