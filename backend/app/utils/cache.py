# Simple cache implementation
from functools import wraps
import time

_cache = {}
_cache_timestamps = {}

class Cache:
    @staticmethod
    def cached(ttl_seconds=300):
        """Cache decorator with time-to-live in seconds"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Create a cache key based on function name and arguments
                key = str(func.__name__) + str(args) + str(kwargs)
                
                # Check if result is in cache and not expired
                current_time = time.time()
                if key in _cache and current_time - _cache_timestamps.get(key, 0) < ttl_seconds:
                    return _cache[key]
                
                # Call the function and cache the result
                result = func(*args, **kwargs)
                _cache[key] = result
                _cache_timestamps[key] = current_time
                return result
            return wrapper
        return decorator

# Create a singleton instance
cache = Cache()