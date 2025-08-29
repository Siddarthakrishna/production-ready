#!/usr/bin/env python3
"""
Test script for Sectorial Heatmap API endpoints
"""

import sys
import os
import requests
import json
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

def test_api_endpoint(url, description):
    """Test a single API endpoint"""
    print(f"\n🧪 Testing: {description}")
    print(f"📡 URL: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS - Status: {response.status_code}")
            print(f"📊 Data items: {len(data.get('data', []))}")
            print(f"📝 Response keys: {list(data.keys())}")
            
            # Show sample data structure
            if data.get('data') and len(data['data']) > 0:
                sample = data['data'][0]
                print(f"🔍 Sample item keys: {list(sample.keys())}")
                
                # Check parameter format
                if 'params' in sample:
                    print(f"📐 Parameter format detected: {list(sample['params'].keys())[:5]}...")
                elif any(key.startswith('param_') for key in sample.keys()):
                    print(f"📐 Legacy parameter format detected")
                
            return True
        else:
            print(f"❌ FAILED - Status: {response.status_code}")
            print(f"🚫 Error: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"💥 CONNECTION ERROR: {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"📄 JSON DECODE ERROR: {e}")
        return False
    except Exception as e:
        print(f"🔥 UNEXPECTED ERROR: {e}")
        return False

def test_sectorial_heatmap_endpoints():
    """Test all sectorial heatmap endpoints"""
    
    # Base URL - Update this to match your server configuration
    BASE_URL = "http://localhost:8001/api"
    
    print("🚀 Starting Sectorial Heatmap API Tests")
    print("=" * 60)
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test endpoints
    endpoints = [
        # Legacy endpoints
        (f"{BASE_URL}/sector/heatmap", "Legacy Sector Heatmap"),
        (f"{BASE_URL}/sector/NIFTYAUTO", "Legacy Sector Detail (NIFTYAUTO)"),
        
        # New enhanced endpoints
        (f"{BASE_URL}/sector/heatmap/sectors", "Enhanced Sector Overview Heatmap"),
        (f"{BASE_URL}/sector/heatmap/sectors?sector_filter=NIFTY50", "Enhanced Sector Heatmap (NIFTY50 Filter)"),
        (f"{BASE_URL}/sector/heatmap/stocks/NIFTYAUTO", "Enhanced Sector Stocks Heatmap (NIFTYAUTO)"),
        (f"{BASE_URL}/sector/heatmap/stocks/BANKNIFTY", "Enhanced Sector Stocks Heatmap (BANKNIFTY)"),
        (f"{BASE_URL}/sector/heatmap/stocks", "Enhanced All Stocks Heatmap"),
        (f"{BASE_URL}/sector/summary", "Sector Summary"),
    ]
    
    results = []
    
    for url, description in endpoints:
        success = test_api_endpoint(url, description)
        results.append((description, success))
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for description, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {description}")
    
    print(f"\n🏆 OVERALL: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("🎉 All tests passed! Sectorial heatmap implementation is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the server and endpoint configurations.")
    
    return passed == total

def test_parameter_system():
    """Test that the parameter system is working correctly"""
    print("\n" + "=" * 60)
    print("🔧 TESTING PARAMETER SYSTEM")
    print("=" * 60)
    
    try:
        # Import and test the parameter normalizer
        from app.services.param_normalizer import ParamNormalizer
        from app.config.global_params import get_module_params, ParamType
        
        print("✅ Successfully imported parameter system components")
        
        # Test sectorial_flow module configuration
        sectorial_params = get_module_params('sectorial_flow')
        print(f"✅ Sectorial flow parameters: {len(sectorial_params)} configured")
        print(f"🔑 Parameter keys: {list(sectorial_params.keys())}")
        
        # Test data normalization
        test_data = {
            "Symbol": "TEST_SECTOR",
            "heatmap": 2.5,
            "price": 100.0,
            "change": 2.5,
            "volume": 1000000,
            "r_factor": 1.2,
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        normalized = ParamNormalizer.normalize(test_data, 'sectorial_flow')
        print(f"✅ Data normalization successful")
        print(f"📊 Normalized structure: {type(normalized)} with keys: {list(normalized.keys())}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Parameter system error: {e}")
        return False

def main():
    """Main test function"""
    print("🔍 SECTORIAL HEATMAP IMPLEMENTATION TEST SUITE")
    print("=" * 80)
    
    # Test parameter system first
    param_success = test_parameter_system()
    
    # Test API endpoints
    api_success = test_sectorial_heatmap_endpoints()
    
    print("\n" + "=" * 80)
    print("🏁 FINAL RESULTS")
    print("=" * 80)
    print(f"📐 Parameter System: {'✅ PASS' if param_success else '❌ FAIL'}")
    print(f"🌐 API Endpoints: {'✅ PASS' if api_success else '❌ FAIL'}")
    
    overall_success = param_success and api_success
    print(f"🎯 Overall Implementation: {'✅ SUCCESS' if overall_success else '❌ NEEDS WORK'}")
    
    if overall_success:
        print("\n🚀 SECTORIAL HEATMAP IS READY FOR USE!")
        print("💡 Next steps:")
        print("   1. Start the backend server: cd backend && python server.py")
        print("   2. Start the frontend server: cd frontend && npm start")
        print("   3. Navigate to sectorial_flow.html page")
        print("   4. Look for the new 'Sectorial Heatmap' section")
    else:
        print("\n⚠️  IMPLEMENTATION NEEDS ATTENTION")
        print("💡 Check the failed components and fix any issues before deployment")
    
    return overall_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)