# Simple observability implementation
import functools
import logging
import time

logger = logging.getLogger(__name__)

def observe(func):
    """Decorator to log function execution time and errors"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            logger.info(f"{func.__name__} executed in {execution_time:.2f} seconds")
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"{func.__name__} failed after {execution_time:.2f} seconds with error: {str(e)}")
            raise
    return wrapper