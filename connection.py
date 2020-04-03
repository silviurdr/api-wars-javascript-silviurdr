import database_common


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