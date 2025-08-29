#!/usr/bin/env python3
"""
Comprehensive Test Suite for Global Parameter System

This test suite validates the implementation of the global parameter system
across all modules according to the SwingCentre documentation requirements.
"""

import sys
import os
import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Any, List

# Add the backend app to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from app.config.global_params import ParamType, get_param_label, get_module_params, MODULE_PARAMS
    from app.services.param_normalizer import ParamNormalizer
    from app.services.services.study_service import StudyService
    from app.services import market_depth_service, money_flux_service, pro_setup_service
except ImportError as e:
    print(f"Import error: {e}")
    print("Please ensure you're running this from the correct directory and all dependencies are installed.")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ParameterSystemTester:
    """Comprehensive tester for the global parameter system"""
    
    def __init__(self):
        self.study_service = StudyService()
        self.test_results = []
        self.failed_tests = []
        
    def run_all_tests(self):
        """Run all parameter system tests"""
        logger.info("Starting Global Parameter System Test Suite")
        logger.info("=" * 60)
        
        # Test 1: Global Parameter Configuration
        self.test_global_parameter_config()
        
        # Test 2: Parameter Normalizer
        self.test_parameter_normalizer()
        
        # Test 3: Swing Center Module
        asyncio.run(self.test_swing_center_module())
        
        # Test 4: Market Depth Module
        self.test_market_depth_module()
        
        # Test 5: Money Flux Module  
        self.test_money_flux_module()
        
        # Test 6: Pro Setup Module
        self.test_pro_setup_module()
        
        # Test 7: Parameter Format Consistency
        self.test_parameter_format_consistency()
        
        # Generate report
        self.generate_test_report()
        
    def test_global_parameter_config(self):
        """Test global parameter configuration"""
        logger.info("Testing Global Parameter Configuration...")
        
        try:
            # Test ParamType enum exists and has expected values
            assert hasattr(ParamType, 'PRICE'), "PRICE parameter not found"
            assert hasattr(ParamType, 'PERCENT_CHANGE'), "PERCENT_CHANGE parameter not found"
            assert hasattr(ParamType, 'HEATMAP_VALUE'), "HEATMAP_VALUE parameter not found"
            
            # Test parameter labels
            price_label = get_param_label(ParamType.PRICE)
            assert price_label == "Last Traded Price", f"Expected 'Last Traded Price', got '{price_label}'"
            
            # Test module parameters
            swing_params = get_module_params("swing_center")
            assert len(swing_params) > 0, "No parameters found for swing_center module"
            
            self.test_results.append({"test": "Global Parameter Config", "status": "PASSED"})
            logger.info("✓ Global Parameter Configuration test passed")
            
        except Exception as e:
            self.failed_tests.append({"test": "Global Parameter Config", "error": str(e)})
            logger.error(f"✗ Global Parameter Configuration test failed: {e}")
    
    def test_parameter_normalizer(self):
        """Test parameter normalizer functionality"""
        logger.info("Testing Parameter Normalizer...")
        
        try:
            # Test swing center normalization
            test_data = {
                "Symbol": "RELIANCE",
                "price": 2500.50,
                "change": 1.5,
                "volume": 1000000,
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            normalized = ParamNormalizer.normalize(test_data, module_name="swing_center")
            
            # Validate structure
            assert "Symbol" in normalized, "Symbol field missing in normalized data"
            assert "params" in normalized, "params field missing in normalized data"
            assert isinstance(normalized["params"], dict), "params should be a dictionary"
            
            # Test metadata
            metadata = ParamNormalizer.get_metadata("swing_center")
            assert "module" in metadata, "module field missing in metadata"
            assert "parameters" in metadata, "parameters field missing in metadata"
            
            self.test_results.append({"test": "Parameter Normalizer", "status": "PASSED"})
            logger.info("✓ Parameter Normalizer test passed")
            
        except Exception as e:
            self.failed_tests.append({"test": "Parameter Normalizer", "error": str(e)})
            logger.error(f"✗ Parameter Normalizer test failed: {e}")
    
    async def test_swing_center_module(self):
        """Test Swing Center module parameter implementation"""
        logger.info("Testing Swing Center Module...")
        
        try:
            # Test advance/decline data
            adv_decline_data = await self.study_service.get_advance_decline_data("NIFTY")
            
            # Validate structure follows SwingCentre documentation
            assert "data" in adv_decline_data, "data field missing"
            assert "timestamp" in adv_decline_data, "timestamp field missing"
            
            if adv_decline_data["data"]:
                first_item = adv_decline_data["data"][0]
                # Should have param_0 (advance %), param_1 (decline %)
                assert "Symbol" in first_item, "Symbol field missing"
                
            # Test weekly performance
            weekly_data = [
                {
                    "Symbol": "NIFTY 50",
                    "weekly_change": 1.5,
                    "current_price": 19500.0,
                    "prev_close": 19200.0,
                    "r_factor": 1.2,
                    "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
            ]
            
            normalized_weekly = ParamNormalizer.normalize(weekly_data, module_name="weekly_performance")
            assert len(normalized_weekly) > 0, "Weekly performance normalization failed"
            
            self.test_results.append({"test": "Swing Center Module", "status": "PASSED"})
            logger.info("✓ Swing Center Module test passed")
            
        except Exception as e:
            self.failed_tests.append({"test": "Swing Center Module", "error": str(e)})
            logger.error(f"✗ Swing Center Module test failed: {e}")
    
    def test_market_depth_module(self):
        """Test Market Depth module parameter implementation"""
        logger.info("Testing Market Depth Module...")
        
        try:
            # Test gainers data
            gainers_data = market_depth_service.get_gainers()
            
            # Validate new parameter format
            assert "data" in gainers_data, "data field missing"
            assert "name" in gainers_data, "name field missing"
            assert "timestamp" in gainers_data, "timestamp field missing"
            
            # Test high power data
            highpower_data = market_depth_service.get_highpower()
            assert "data" in highpower_data, "data field missing in highpower"
            
            self.test_results.append({"test": "Market Depth Module", "status": "PASSED"})
            logger.info("✓ Market Depth Module test passed")
            
        except Exception as e:
            self.failed_tests.append({"test": "Market Depth Module", "error": str(e)})
            logger.error(f"✗ Market Depth Module test failed: {e}")
    
    def test_money_flux_module(self):
        """Test Money Flux module parameter implementation"""
        logger.info("Testing Money Flux Module...")
        
        try:
            # Test heatmap data
            heatmap_data = money_flux_service.get_heatmap_snapshot("NIFTY50")
            
            # Validate new parameter format
            assert "data" in heatmap_data, "data field missing"
            assert "name" in heatmap_data, "name field missing"
            assert "timestamp" in heatmap_data, "timestamp field missing"
            
            # Test sentiment analysis
            sentiment_data = money_flux_service.get_sentiment_analysis("NIFTY50")
            assert "data" in sentiment_data, "data field missing in sentiment"
            
            self.test_results.append({"test": "Money Flux Module", "status": "PASSED"})
            logger.info("✓ Money Flux Module test passed")
            
        except Exception as e:
            self.failed_tests.append({"test": "Money Flux Module", "error": str(e)})
            logger.error(f"✗ Money Flux Module test failed: {e}")
    
    def test_pro_setup_module(self):
        """Test Pro Setup module parameter implementation"""
        logger.info("Testing Pro Setup Module...")
        
        try:
            # Test pro setups data
            pro_data = pro_setup_service.get_pro_setups()
            
            # Validate new parameter format
            assert "data" in pro_data, "data field missing"
            assert "name" in pro_data, "name field missing"
            assert "timestamp" in pro_data, "timestamp field missing"
            
            # Test 5-min spike data
            spike_data = pro_setup_service.get_spike_5min()
            assert "data" in spike_data, "data field missing in spike data"
            
            self.test_results.append({"test": "Pro Setup Module", "status": "PASSED"})
            logger.info("✓ Pro Setup Module test passed")
            
        except Exception as e:
            self.failed_tests.append({"test": "Pro Setup Module", "error": str(e)})
            logger.error(f"✗ Pro Setup Module test failed: {e}")
    
    def test_parameter_format_consistency(self):
        """Test that all modules return data in consistent parameter format"""
        logger.info("Testing Parameter Format Consistency...")
        
        try:
            # Define expected structure
            expected_structure = {
                "data": list,
                "name": str,
                "timestamp": str
            }
            
            # Test various module outputs
            test_cases = [
                ("Market Depth", market_depth_service.get_gainers()),
                ("Money Flux", money_flux_service.get_heatmap_snapshot("NIFTY50")),
                ("Pro Setup", pro_setup_service.get_pro_setups()),
            ]
            
            for module_name, data in test_cases:
                for field, expected_type in expected_structure.items():
                    assert field in data, f"{field} missing in {module_name}"
                    assert isinstance(data[field], expected_type), f"{field} wrong type in {module_name}"
            
            self.test_results.append({"test": "Parameter Format Consistency", "status": "PASSED"})
            logger.info("✓ Parameter Format Consistency test passed")
            
        except Exception as e:
            self.failed_tests.append({"test": "Parameter Format Consistency", "error": str(e)})
            logger.error(f"✗ Parameter Format Consistency test failed: {e}")
    
    def generate_test_report(self):
        """Generate comprehensive test report"""
        logger.info("=" * 60)
        logger.info("GLOBAL PARAMETER SYSTEM TEST REPORT")
        logger.info("=" * 60)
        
        total_tests = len(self.test_results) + len(self.failed_tests)
        passed_tests = len(self.test_results)
        failed_tests = len(self.failed_tests)
        
        logger.info(f"Total Tests: {total_tests}")
        logger.info(f"Passed: {passed_tests}")
        logger.info(f"Failed: {failed_tests}")
        logger.info(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if self.test_results:
            logger.info("\n✓ PASSED TESTS:")
            for result in self.test_results:
                logger.info(f"  - {result['test']}")
        
        if self.failed_tests:
            logger.info("\n✗ FAILED TESTS:")
            for failure in self.failed_tests:
                logger.info(f"  - {failure['test']}: {failure['error']}")
        
        logger.info("\n" + "=" * 60)
        
        # Summary message
        if failed_tests == 0:
            logger.info("🎉 ALL TESTS PASSED! Global Parameter System is working correctly.")
        else:
            logger.info(f"⚠️  {failed_tests} test(s) failed. Please review the implementation.")
        
        logger.info("=" * 60)


def main():
    """Main test execution function"""
    tester = ParameterSystemTester()
    tester.run_all_tests()


if __name__ == "__main__":
    main()