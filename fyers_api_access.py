from fyers_apiv3 import fyersModel
import os
import json
import webbrowser
from datetime import datetime, timedelta

class FyersAPIClient:
    def __init__(self, credentials_file="fyers_credentials.json"):
        self.credentials_file = credentials_file
        self.fyers = None
        self.ensure_logs_directory()
        
    def ensure_logs_directory(self):
        """Ensure the logs directory exists."""
        self.logs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
        if not os.path.exists(self.logs_dir):
            os.makedirs(self.logs_dir, exist_ok=True)
    
    def get_credentials(self):
        """Get credentials from file or prompt user."""
        try:
            with open(self.credentials_file, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            print("---- Enter your Fyers Login Credentials ----")
            credentials = {
                "api_key": input("Enter API Key: ").strip(),
                "api_secret": input("Enter API Secret: ").strip(),
                "redirect_url": "https://www.google.com/"  # Using a simple redirect URL
            }
            
            if input("Save credentials? (y/n): ").lower() == 'y':
                with open(self.credentials_file, 'w') as f:
                    json.dump(credentials, f, indent=2)
                print(f"Credentials saved to '{self.credentials_file}'")
            return credentials
    
    def authenticate(self):
        """Authenticate with Fyers API."""
        credentials = self.get_credentials()
        
        session = fyersModel.SessionModel(
            client_id=credentials["api_key"],
            secret_key=credentials["api_secret"],
            redirect_uri=credentials["redirect_url"],
            response_type="code",
            grant_type="authorization_code"
        )
        
        print("\nOpening authentication URL in your browser...")
        auth_url = session.generate_authcode()
        webbrowser.open(auth_url, new=1)
        
        print(f"\nIf browser didn't open, please visit this URL manually:\n{auth_url}")
        auth_code = input("\nAfter authenticating, you'll be redirected. Paste the URL you were redirected to: ").strip()
        
        # Extract the auth code from the URL
        try:
            auth_code = auth_code.split('auth_code=')[1].split('&')[0]
        except:
            print("Could not extract auth code from the provided URL. Please try again.")
            return False
            
        try:
            session.set_token(auth_code)
            token_response = session.generate_token()
            
            if 'access_token' not in token_response:
                print("Error in authentication. Response:", token_response)
                return False
                
            self.access_token = token_response["access_token"]
            
            self.fyers = fyersModel.FyersModel(
                client_id=credentials["api_key"],
                token=self.access_token,
                log_path=self.logs_dir + "/"
            )
            
            print("\nAuthentication successful!")
            return True
            
        except Exception as e:
            print(f"Authentication failed: {str(e)}")
            return False
    
    def get_profile(self):
        """Fetch and return user profile."""
        if not self.fyers:
            print("Not authenticated. Please authenticate first.")
            return None
            
        try:
            profile = self.fyers.get_profile()
            print("Profile API Response:", json.dumps(profile, indent=2))  # Debug print
            
            if profile.get('code') == 200:
                # Save profile
                with open('fyers_profile.json', 'w') as f:
                    json.dump(profile, f, indent=2)
                return profile
            else:
                print(f"Error: {profile.get('message', 'Unknown error')}")
                return None
        except Exception as e:
            print(f"Error fetching profile: {str(e)}")
            return None

def main():
    # Example usage
    client = FyersAPIClient()
    
    # Authenticate
    if client.authenticate():
        # Get and display profile
        profile = client.get_profile()
        if profile:
            data = profile.get('data', {})
            print("\n--- Profile Details ---")
            print(f"Name: {data.get('name', 'N/A')}")
            print(f"Email: {data.get('email_id', 'N/A')}")
            print(f"Client ID: {data.get('client_id', 'N/A')}")
            print(f"Exchanges: {', '.join(data.get('exchanges', ['N/A']))}")
            print(f"Products: {', '.join(data.get('products', ['N/A']))}")

if __name__ == "__main__":
    main()