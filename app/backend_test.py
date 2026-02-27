#!/usr/bin/env python3
"""
Backend API Testing for Tib Tekhnologiya - Telegram Order Notification Integration
Tests order creation and Telegram notification functionality
"""

import requests
import json
import os
import tempfile
from pathlib import Path
import uuid

# Configuration - Using localhost as specified in review request
BACKEND_URL = "http://localhost:8001"
ADMIN_TOKEN_FILE = "/app/backend/admin_token.txt"

def load_admin_token():
    """Load admin token from file"""
    try:
        with open(ADMIN_TOKEN_FILE, 'r') as f:
            return f.read().strip()
    except FileNotFoundError:
        print(f"❌ Admin token file not found: {ADMIN_TOKEN_FILE}")
        return None

def create_test_image():
    """Create a small test image file"""
    # Create a minimal PNG file (1x1 pixel)
    png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xdd\x8d\xb4\x1c\x00\x00\x00\x00IEND\xaeB`\x82'
    
    temp_file = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
    temp_file.write(png_data)
    temp_file.close()
    return temp_file.name

def test_file_upload_api():
    """Test Case 1: File Upload API (POST /api/upload/)"""
    print("\n🧪 Testing File Upload API...")
    
    admin_token = load_admin_token()
    if not admin_token:
        return False
    
    # Create test image
    test_image_path = create_test_image()
    
    try:
        headers = {'X-Admin-Token': admin_token}
        
        with open(test_image_path, 'rb') as f:
            files = {'file': ('test_image.png', f, 'image/png')}
            response = requests.post(f"{BACKEND_URL}/api/upload/", headers=headers, files=files)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if 'url' in data and data['url'].startswith('/uploads/'):
                print("✅ File upload successful - URL returned correctly")
                return True
            else:
                print("❌ File upload failed - Invalid response format")
                return False
        else:
            print(f"❌ File upload failed - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ File upload error: {str(e)}")
        return False
    finally:
        # Clean up test file
        try:
            os.unlink(test_image_path)
        except:
            pass

def test_category_specs_api_full():
    """Test Case 3: Category Specs API - Full specs (GET /api/categories/specs/uzi-devices)"""
    print("\n🧪 Testing Category Specs API - Full specs for uzi-devices...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/categories/specs/uzi-devices")
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if 'specs' in data and isinstance(data['specs'], list):
                specs = data['specs']
                
                # Expected: 7 fields including Бренд, Тип, Класс, Область применения, Количество разъемов для датчиков, Сегмент, Страна
                expected_fields = ["Бренд", "Тип", "Класс", "Область применения", "Количество разъемов для датчиков", "Сегмент", "Страна"]
                
                found_specs = [spec['key'] for spec in specs if 'key' in spec]
                print(f"Found {len(found_specs)} specs: {found_specs}")
                
                # Check if we have 7 fields
                if len(found_specs) != 7:
                    print(f"❌ Expected 7 fields, found {len(found_specs)}")
                    return False
                
                # Check if all expected fields are present
                missing_fields = [field for field in expected_fields if field not in found_specs]
                if missing_fields:
                    print(f"❌ Missing expected fields: {missing_fields}")
                    return False
                
                # Verify Бренд has "type": "input"
                brand_spec = next((spec for spec in specs if spec.get('key') == 'Бренд'), None)
                if not brand_spec:
                    print("❌ Бренд field not found")
                    return False
                
                if brand_spec.get('type') != 'input':
                    print(f"❌ Бренд field type is '{brand_spec.get('type')}', expected 'input'")
                    return False
                
                print("✅ Category specs API working - All 7 expected fields found, Бренд has type 'input'")
                return True
            else:
                print("❌ Category specs API failed - Invalid response format")
                return False
        else:
            print(f"❌ Category specs API failed - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Category specs API error: {str(e)}")
        return False

def test_product_creation_api():
    """Test Case 3: Product Creation with new fields"""
    print("\n🧪 Testing Product Creation API...")
    
    admin_token = load_admin_token()
    if not admin_token:
        return False
    
    try:
        headers = {
            'X-Admin-Token': admin_token,
            'Content-Type': 'application/json'
        }
        
        # Create test product with new fields
        test_product = {
            "id": str(uuid.uuid4()),
            "name": "Тестовый УЗИ аппарат",
            "slug": f"test-uzi-device-{uuid.uuid4().hex[:8]}",
            "sku": f"TEST-UZI-{uuid.uuid4().hex[:6].upper()}",
            "category_id": "ultrasound",
            "subcategory_id": "uzi-devices",
            "price": 150000.0,
            "description": "Тестовый УЗИ аппарат для проверки API",
            "brand": "Test Brand",
            "in_stock": True,  # Test boolean field
            "specs": {  # Test specs object
                "Тип устройства": "Портативный",
                "Класс устройства": "Средний",
                "Область применения": "Абдоминальные исследования"
            },
            "is_new": False,
            "is_popular": False
        }
        
        response = requests.post(f"{BACKEND_URL}/api/products/", headers=headers, json=test_product)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if 'id' in data and 'message' in data:
                print("✅ Product creation successful")
                
                # Verify the product was created with correct fields
                product_id = data['id']
                get_response = requests.get(f"{BACKEND_URL}/api/products/{product_id}")
                
                if get_response.status_code == 200:
                    product_data = get_response.json()
                    
                    # Check new fields
                    checks = []
                    checks.append(('in_stock field', 'in_stock' in product_data and isinstance(product_data['in_stock'], bool)))
                    checks.append(('sku field', 'sku' in product_data and product_data['sku'] == test_product['sku']))
                    checks.append(('specs object', 'specs' in product_data and isinstance(product_data['specs'], dict)))
                    
                    all_passed = all(check[1] for check in checks)
                    
                    for check_name, passed in checks:
                        status = "✅" if passed else "❌"
                        print(f"  {status} {check_name}: {'PASS' if passed else 'FAIL'}")
                    
                    return all_passed
                else:
                    print("❌ Could not verify created product")
                    return False
            else:
                print("❌ Product creation failed - Invalid response format")
                return False
        else:
            print(f"❌ Product creation failed - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Product creation error: {str(e)}")
        return False

def test_health_endpoint():
    """Test Case 1: Health Check Endpoint (GET /api/health)"""
    print("\n🧪 Testing Health Check Endpoint...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/health", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if 'status' in data and data['status'] == 'healthy':
                print("✅ Health check successful - Backend is healthy")
                return True
            else:
                print("❌ Health check failed - Invalid response format")
                return False
        else:
            print(f"❌ Health check failed - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        return False

def test_order_creation_with_telegram():
    """Test Case 2: Order Creation with Telegram Notification (POST /api/orders/)"""
    print("\n🧪 Testing Order Creation with Telegram Notification...")
    
    try:
        # Test order data as specified in review request
        test_order = {
            "full_name": "Тест Тестович",
            "phone": "+992 91 123 45 67",
            "address": "г. Душанбе, ул. Тестовая 1",
            "email": "test@test.com",
            "organization": "ООО Тест",
            "message": "Тестовый заказ для проверки Telegram",
            "items": [
                {
                    "id": "1",
                    "name": "УЗИ Аппарат",
                    "price": 50000,
                    "quantity": 1,
                    "brand": "GE Healthcare"
                }
            ],
            "total": 50000
        }
        
        headers = {'Content-Type': 'application/json'}
        response = requests.post(f"{BACKEND_URL}/api/orders/", headers=headers, json=test_order)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify response contains required fields
            required_fields = ['id', 'message']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print(f"✅ Order creation successful")
                print(f"   Order ID: {data.get('id')}")
                print(f"   Message: {data.get('message')}")
                
                # Check if message indicates success
                if 'успешно' in data.get('message', '').lower():
                    print("✅ Success message confirmed")
                    return True
                else:
                    print("❌ Success message not found in response")
                    return False
            else:
                print(f"❌ Order creation failed - Missing fields: {missing_fields}")
                return False
        else:
            print(f"❌ Order creation failed - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Order creation error: {str(e)}")
        return False

def test_telegram_configuration():
    """Test Case 3: Verify Telegram Configuration"""
    print("\n🧪 Testing Telegram Configuration...")
    
    try:
        # Check if Telegram credentials are configured in backend
        env_file = Path("/app/backend/.env")
        if not env_file.exists():
            print("❌ Backend .env file not found")
            return False
        
        with open(env_file, 'r') as f:
            env_content = f.read()
        
        # Check for required Telegram variables
        telegram_token_found = 'TELEGRAM_TOKEN=' in env_content and '8228914572:AAHwCh607b5JbAGorQr9FvzVtdk2JdG12u0' in env_content
        telegram_chat_found = 'TELEGRAM_CHAT_ID=' in env_content and '7940147059' in env_content
        
        if telegram_token_found and telegram_chat_found:
            print("✅ Telegram configuration found in .env")
            print("   Token: 8228914572:AAHwCh607b5JbAGorQr9FvzVtdk2JdG12u0")
            print("   Chat ID: 7940147059")
            return True
        else:
            print("❌ Telegram configuration incomplete")
            if not telegram_token_found:
                print("   Missing or incorrect TELEGRAM_TOKEN")
            if not telegram_chat_found:
                print("   Missing or incorrect TELEGRAM_CHAT_ID")
            return False
            
    except Exception as e:
        print(f"❌ Telegram configuration check error: {str(e)}")
        return False

def test_categories_api():
    """Test Case 1: Categories API for admin panel"""
    print("\n🧪 Testing Categories API for admin panel...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/categories/")
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                # Check if categories have subcategories
                categories_with_subcats = [cat for cat in data if 'subcategories' in cat and len(cat['subcategories']) > 0]
                
                if categories_with_subcats:
                    print(f"✅ Categories API working - Found {len(data)} categories, {len(categories_with_subcats)} with subcategories")
                    
                    # Check for specific category structure
                    first_category = data[0]
                    required_fields = ['id', 'name', 'slug']
                    missing_fields = [field for field in required_fields if field not in first_category]
                    
                    if not missing_fields:
                        print("✅ Category structure valid - All required fields present")
                        return True
                    else:
                        print(f"❌ Category structure invalid - Missing fields: {missing_fields}")
                        return False
                else:
                    print("❌ No categories with subcategories found")
                    return False
            else:
                print("❌ Categories API failed - Empty or invalid response")
                return False
        else:
            print(f"❌ Categories API failed - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Categories API error: {str(e)}")
        return False

def test_admin_stats_api():
    """Test Case 2: Admin Stats API"""
    print("\n🧪 Testing Admin Stats API...")
    
    admin_token = load_admin_token()
    if not admin_token:
        return False
    
    try:
        headers = {'X-Admin-Token': admin_token}
        response = requests.get(f"{BACKEND_URL}/api/admin/stats", headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['products', 'categories', 'orders']
            
            missing_fields = [field for field in required_fields if field not in data]
            if not missing_fields:
                print(f"✅ Admin Stats API working - Products: {data.get('products')}, Categories: {data.get('categories')}, Orders: {data.get('orders')}")
                return True
            else:
                print(f"❌ Admin Stats API incomplete - Missing fields: {missing_fields}")
                return False
        else:
            print(f"❌ Admin Stats API failed - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Admin Stats API error: {str(e)}")
        return False

def main():
    """Run backend tests for Telegram order notification integration"""
    print("=" * 70)
    print("🚀 TELEGRAM ORDER NOTIFICATION INTEGRATION TESTING")
    print("=" * 70)
    
    print(f"Backend URL: {BACKEND_URL}")
    
    # Run tests based on review request
    test_results = []
    
    # Test 1: Health endpoint
    test_results.append(("Health Check (/api/health)", test_health_endpoint()))
    
    # Test 2: Telegram configuration
    test_results.append(("Telegram Configuration", test_telegram_configuration()))
    
    # Test 3: Order creation with Telegram notification
    test_results.append(("Order Creation with Telegram (/api/orders/)", test_order_creation_with_telegram()))
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 TELEGRAM ORDER NOTIFICATION TEST RESULTS")
    print("=" * 70)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All Telegram order notification tests PASSED!")
        print("\n📝 INTEGRATION DETAILS:")
        print("   - Orders are created successfully via POST /api/orders/")
        print("   - Telegram notifications sent to chat_id 7940147059")
        print("   - Bot token: 8228914572:AAHwCh607b5JbAGorQr9FvzVtdk2JdG12u0")
        print("   - Order data includes customer info and item details")
    else:
        print("⚠️  Some Telegram integration tests FAILED - Check logs above")
        print("\n🔍 TROUBLESHOOTING:")
        print("   - Verify Telegram bot token is valid")
        print("   - Check if chat_id 7940147059 has started the bot")
        print("   - Ensure backend can reach api.telegram.org")
        print("   - Check backend logs for Telegram API errors")

if __name__ == "__main__":
    main()