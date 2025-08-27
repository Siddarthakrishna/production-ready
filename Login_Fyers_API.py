from fyers_apiv3 import fyersModel
import os, time, json, datetime, sys

try:
    with open(f"fyers_login_details.json", "r") as f:
        login_credential = json.load(f)
except:
    print("---- Enter you Fyers Login Credentials  ----")
    login_credential = {"api_key": str(input("Enter API Key : ").strip()),
                        "api_secret": str(input("Enter API Secret : ").strip()),
                        "redirect_url": str(input("Enter Redirect URL : ").strip())}
    if input("Press Y to save login credential and any key to bypass : ").upper() == "Y":
        with open(f"fyers_login_details.json", "w") as f:
            json.dump(login_credential, f)
        print("'fyers_login_details.json' Saved.")
    else:
        print("'fyers_login_details.json' canceled!!!!!")
        time.sleep(5)
        sys.exit()


if os.path.exists(f"AccessToken/{datetime.datetime.now().date()}.json"):
    with open(f"AccessToken/{datetime.datetime.now().date()}.json", "r") as f:
        access_token = json.load(f)
else:
    print("Trying Log In...")
    try:
        app_session = fyersModel.SessionModel(client_id=login_credential["api_key"],
                                              secret_key=login_credential["api_secret"],
                                              redirect_uri=login_credential["redirect_url"],
                                              response_type='code',
                                              grant_type="authorization_code")
        print("Login url : ", app_session.generate_authcode())
        auth_code = input("Login and enter your 'auth code' here : ").strip()
        app_session.set_token(auth_code)
        access_token = app_session.generate_token()["access_token"]
        os.makedirs(f"AccessToken", exist_ok=True)
        with open(f"AccessToken/{datetime.datetime.now().date()}.json", "w") as f:
            json.dump(access_token, f)
    except Exception as e:
        print(f"Login Failed {e}!!!!!")
        time.sleep(5)
        sys.exit()

print(f"API Key : {login_credential['api_key']}")
print(f"Access Token : {access_token}")

