from fyers_apiv3 import fyersModel
import os
import json
import logging
from datetime import datetime

def ensure_logs_directory():
    """Ensure the logs directory exists."""
    logs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir, exist_ok=True)
    return logs_dir

def get_fyers_credentials():
    try:
        with open("fyers_login_details.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print("---- Enter your Fyers Login Credentials ----")
        credentials = {
            "api_key": input("Enter API Key: ").strip(),
            "api_secret": input("Enter API Secret: ").strip(),
            "redirect_url": input("Enter Redirect URL: ").strip()
        }
        
        if input("Save credentials? (y/n): ").lower() == 'y':
            with open('fyers_login_details.json', 'w') as f:
                json.dump(credentials, f, indent=2)
            print("Credentials saved to 'fyers_login_details.json'")
        return credentials

def main():
    # Ensure logs directory exists
    logs_dir = ensure_logs_directory()
    
    # Get credentials
    credentials = get_fyers_credentials()
    
    # Create session
    session = fyersModel.SessionModel(
        client_id=credentials["api_key"],
        secret_key=credentials["api_secret"],
        redirect_uri=credentials["redirect_url"],
        response_type="code",
        grant_type="authorization_code"
    )
    
    # Generate auth URL and get auth code
    print("\nOpening authentication URL...")
    auth_url = session.generate_authcode()
    print(f"Please visit this URL and authenticate: {auth_url}")
    auth_code = input("Enter the authorization code from the URL: ").strip()
    
    # Generate access token
    session.set_token(auth_code)
    token_response = session.generate_token()
    access_token = token_response["access_token"]
    
    print(f"\nAuthentication successful!")
    print(f"Access Token: {access_token[:15]}...")  # Show first 15 chars for security
    
    try:
        # Initialize Fyers client with error handling
        fyers = fyersModel.FyersModel(
            client_id=credentials["api_key"],
            token=access_token,
            log_path=logs_dir + "/"  # Ensure trailing slash
        )
        
        # Get and display profile
        print("\nFetching profile details...")
        profile = fyers.get_profile()
        
        if profile.get('code') == 200:
            data = profile.get('data', {})
            print("\n--- Profile Details ---")
            print(f"Name: {data.get('name', 'N/A')}")
            print(f"Email: {data.get('email_id', 'N/A')}")
            print(f"Client ID: {data.get('client_id', 'N/A')}")
            print(f"Exchanges: {', '.join(data.get('exchanges', ['N/A']))}")
            print(f"Products: {', '.join(data.get('products', ['N/A']))}")
            
            # Save profile
            with open('fyers_profile.json', 'w') as f:
                json.dump(profile, f, indent=2)
            print("\nProfile saved to 'fyers_profile.json'")
        else:
            print(f"Error: {profile.get('message', 'Unknown error')}")
            
    except Exception as e:
        print(f"Error initializing Fyers client: {str(e)}")
        print("Please check your internet connection and try again.")

if __name__ == "__main__":
    main()