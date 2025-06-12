#!/usr/bin/env python3
"""
WINZO Platform Comprehensive Test Suite
Tests all API endpoints and functionality
"""
import requests
import json
import time
import sys
from datetime import datetime

class WinzoTester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        self.test_results = []

    def log_test(self, test_name, success, message="", data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "data": data,
        }
        self.test_results.append(result)
        status = "PASS" if success else "FAIL"
        print(f"{status} {test_name}: {message}")
        if not success:
            print(f"  Error details: {data}")

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\nTesting Authentication Endpoints...")
        # Test login
        try:
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json={"username": "testuser2", "password": "testuser2"},
            )
            if response.status_code == 200 and response.json().get("success"):
                data = response.json()["data"]
                self.auth_token = data["token"]
                self.user_id = data["user"]["id"]
                self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                self.log_test("User Login", True, "Successfully logged in")
            else:
                self.log_test("User Login", False, "Login failed", response.text)
                return False
        except Exception as e:
            self.log_test("User Login", False, "Login exception", str(e))
            return False
        # Test profile endpoint
        try:
            response = self.session.get(f"{self.base_url}/api/auth/profile")
            if response.status_code == 200 and response.json().get("success"):
                self.log_test("Get Profile", True, "Profile retrieved successfully")
            else:
                self.log_test("Get Profile", False, "Profile retrieval failed", response.text)
        except Exception as e:
            self.log_test("Get Profile", False, "Profile exception", str(e))
            return False
        return True

    def test_sports_endpoints(self):
        """Test sports data endpoints"""
        print("\nTesting Sports Data Endpoints...")
        try:
            response = self.session.get(f"{self.base_url}/api/sports")
            if response.status_code == 200 and response.json().get("success"):
                sports_data = response.json()["data"]
                self.log_test("Get Sports", True, f"Retrieved {len(sports_data)} sports")
                if sports_data:
                    sport_key = sports_data[0]["key"]
                    response = self.session.get(f"{self.base_url}/api/sports/{sport_key}/odds")
                    if response.status_code == 200 and response.json().get("success"):
                        odds_data = response.json()["data"]
                        self.log_test(
                            "Get Odds",
                            True,
                            f"Retrieved odds for {len(odds_data)} events",
                        )
                    else:
                        self.log_test("Get Odds", False, "Odds retrieval failed", response.text)
            else:
                self.log_test("Get Sports", False, "Sports retrieval failed", response.text)
        except Exception as e:
            self.log_test("Get Sports", False, "Sports exception", str(e))

    def test_wallet_endpoints(self):
        """Test wallet functionality"""
        print("\nTesting Wallet Endpoints...")
        try:
            response = self.session.get(f"{self.base_url}/api/wallet/balance")
            if response.status_code == 200 and response.json().get("success"):
                balance_data = response.json()["data"]
                initial_balance = balance_data["balance"]
                self.log_test("Get Wallet Balance", True, f"Balance: ${initial_balance}")
                response = self.session.post(
                    f"{self.base_url}/api/wallet/deposit",
                    json={"amount": 100, "paymentMethod": "test"},
                )
                if response.status_code == 200 and response.json().get("success"):
                    new_balance = response.json()["data"]["newBalance"]
                    self.log_test(
                        "Wallet Deposit", True, f"Deposited $100, new balance: ${new_balance}"
                    )
                else:
                    self.log_test("Wallet Deposit", False, "Deposit failed", response.text)
            else:
                self.log_test("Get Wallet Balance", False, "Balance retrieval failed", response.text)
        except Exception as e:
            self.log_test("Wallet Operations", False, "Wallet exception", str(e))

    def test_betting_endpoints(self):
        """Test betting functionality"""
        print("\nTesting Betting Endpoints...")
        try:
            response = self.session.get(
                f"{self.base_url}/api/sports/americanfootball_nfl/odds?limit=1"
            )
            if response.status_code == 200 and response.json().get("success"):
                odds_data = response.json()["data"]
                if odds_data:
                    event = odds_data[0]
                    if event.get("bookmakers"):
                        market = event["bookmakers"][0]["markets"][0]
                        outcome = market["outcomes"][0]
                        bet_data = {
                            "bets": [
                                {
                                    "eventId": event["id"],
                                    "selectedTeam": outcome["name"],
                                    "odds": outcome["price"],
                                    "stake": 10,
                                    "marketType": "h2h",
                                    "bookmaker": event["bookmakers"][0]["title"],
                                }
                            ],
                            "betType": "single",
                            "totalStake": 10,
                            "potentialPayout": 10 * (outcome["price"] / 100 if outcome["price"] > 0 else 100 / abs(outcome["price"])),
                        }
                        response = self.session.post(
                            f"{self.base_url}/api/bets/place", json=bet_data
                        )
                        if response.status_code == 200 and response.json().get("success"):
                            bet_result = response.json()["data"]
                            self.log_test(
                                "Place Bet",
                                True,
                                f"Bet placed successfully, ID: {bet_result['betIds'][0]}",
                            )
                            response = self.session.get(
                                f"{self.base_url}/api/bets/history?limit=5"
                            )
                            if response.status_code == 200 and response.json().get("success"):
                                history_data = response.json()["data"]
                                self.log_test(
                                    "Get Betting History",
                                    True,
                                    f"Retrieved {len(history_data)} bets",
                                )
                            else:
                                self.log_test(
                                    "Get Betting History", False, "History retrieval failed", response.text
                                )
                        else:
                            self.log_test("Place Bet", False, "Bet placement failed", response.text)
                    else:
                        self.log_test("Place Bet", False, "No bookmakers available for testing")
                else:
                    self.log_test("Place Bet", False, "No events available for testing")
            else:
                self.log_test(
                    "Get Odds for Betting",
                    False,
                    "Could not get odds for betting test",
                    response.text,
                )
        except Exception as e:
            self.log_test("Betting Operations", False, "Betting exception", str(e))

    def test_api_quota_usage(self):
        """Test API quota monitoring"""
        print("\nTesting API Quota Usage...")
        try:
            response = self.session.get(f"{self.base_url}/api/sports")
            if response.status_code == 200 and response.json().get("success"):
                quota_info = response.json().get("quota")
                if quota_info:
                    self.log_test(
                        "API Quota Monitoring",
                        True,
                        f"Used: {quota_info['used']}/{quota_info['total']} ({quota_info['percentUsed']}%)",
                    )
                else:
                    self.log_test("API Quota Monitoring", False, "No quota information returned")
            else:
                self.log_test("API Quota Monitoring", False, "Could not check quota", response.text)
        except Exception as e:
            self.log_test("API Quota Monitoring", False, "Quota check exception", str(e))

    def run_all_tests(self):
        """Run all tests"""
        print("=" * 60)
        print("Starting WINZO Platform Comprehensive Tests")
        start_time = time.time()
        if self.test_auth_endpoints():
            self.test_sports_endpoints()
            self.test_wallet_endpoints()
            self.test_betting_endpoints()
            self.test_api_quota_usage()
        end_time = time.time()
        duration = end_time - start_time
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print(f"Duration: {duration:.2f} seconds")
        if failed_tests > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f" - {result['test']}: {result['message']}")
        with open("test_results.json", "w") as f:
            json.dump(
                {
                    "summary": {
                        "total_tests": total_tests,
                        "passed_tests": passed_tests,
                        "failed_tests": failed_tests,
                        "success_rate": (passed_tests / total_tests) * 100,
                        "duration": duration,
                        "timestamp": datetime.now().isoformat(),
                    },
                    "detailed_results": self.test_results,
                },
                f,
                indent=2,
            )
        print("\nDetailed results saved to test_results.json")
        return failed_tests == 0


def main():
    import argparse

    parser = argparse.ArgumentParser(description="WINZO Platform Test Suite")
    parser.add_argument(
        "--url", default="http://localhost:5000", help="Base URL for the API (default: http://localhost:5000)"
    )
    args = parser.parse_args()
    tester = WinzoTester(args.url)
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
