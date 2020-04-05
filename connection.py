import database_common
import json

@database_common.connection_handler
def check_if_already_registered(cursor, username):
    cursor.execute("""
    SELECT * FROM users
    where username = '{0}'
    """.format(username))
    username_used = cursor.fetchone()
    if username_used is None:
        return False
    else:
        return True


@database_common.connection_handler
def register(cursor, user_details):
    cursor.execute("""
    INSERT INTO users
    (username, password) VALUES('{0}', '{1}');
    """.format(user_details['username'], user_details['password']))


@database_common.connection_handler
def check_login(cursor, login_details):
    cursor.execute("""
    SELECT * FROM users
    WHERE username='{0}' AND password='{1}'
    """.format(login_details['username'], login_details['password']))
    logged_user = cursor.fetchone()
    return logged_user


@database_common.connection_handler
def get_password_for_user(cursor, user):
    cursor.execute("""
    SELECT password FROM users
    WHERE username='{0}'
    """.format(user))
    password_dict = cursor.fetchone()
    return password_dict


@database_common.connection_handler
def register_vote(cursor, voted_planet):
    cursor.execute("""
    INSERT INTO planet_votes
    (planet_id, planet_name, user_id, submission_time)
    VALUES ({0}, '{1}', {2}, CURRENT_TIMESTAMP(0));
    """.format(voted_planet['id'], voted_planet['name'], 17))


@database_common.connection_handler
def get_vote_stats(cursor):
    cursor.execute("""
    SELECT planet_name, COUNT(id) from planet_votes
    GROUP by planet_name
    """)
    voting_stats = cursor.fetchall()
    json_voting_stats = {"vote_results": []}
    voted_planets = len(voting_stats)
    for i in range(voted_planets):
        json_voting_stats['vote_results'].append({"planet_name": voting_stats[i]['planet_name'],
                                           "voting_stats": voting_stats[i]['count']})
    return json_voting_stats


