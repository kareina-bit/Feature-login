# API Testing Script for Task #29 & #30 Review
# Run this script to quickly test all endpoints

param(
    [string]$BaseUrl = "http://localhost:5000"
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  API ENDPOINTS TESTING" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nBase URL: $BaseUrl" -ForegroundColor Yellow
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow

# Test counter
$testNumber = 1
$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = @{},
        [hashtable]$Headers = @{},
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "`n[$testNumber] Testing: $Name" -ForegroundColor Cyan
    Write-Host "  Method: $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $url = "$BaseUrl$Endpoint"
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $Headers
            ErrorAction = 'Stop'
        }
        
        if ($Body.Count -gt 0) {
            $params.Body = ($Body | ConvertTo-Json -Compress)
            $params.ContentType = 'application/json'
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "  Status: SUCCESS" -ForegroundColor Green
        Write-Host "  Response:" -ForegroundColor Gray
        $response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White
        
        $script:passed++
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorBody = $_.ErrorDetails.Message
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "  Status: EXPECTED ERROR ($statusCode)" -ForegroundColor Yellow
            Write-Host "  Response:" -ForegroundColor Gray
            $errorBody | Write-Host -ForegroundColor White
            $script:passed++
        }
        else {
            Write-Host "  Status: FAILED (Expected: $ExpectedStatus, Got: $statusCode)" -ForegroundColor Red
            Write-Host "  Error:" -ForegroundColor Red
            $errorBody | Write-Host -ForegroundColor Red
            $script:failed++
        }
        return $null
    }
    finally {
        $script:testNumber++
    }
}

# ========================================
# TASK #30: API ENDPOINTS TESTS
# ========================================

Write-Host "`n`n========================================" -ForegroundColor Yellow
Write-Host "  TASK #30: API ENDPOINTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Yellow

# Test 1: Send OTP for Registration
$testPhone = "+84" + (Get-Random -Minimum 100000000 -Maximum 999999999)
Test-Endpoint `
    -Name "Send OTP (Register)" `
    -Method "POST" `
    -Endpoint "/api/auth/send-otp" `
    -Body @{phone=$testPhone; purpose="register"}

# Test 2: Send OTP for existing user (should fail)
Test-Endpoint `
    -Name "Send OTP (Existing Phone)" `
    -Method "POST" `
    -Endpoint "/api/auth/send-otp" `
    -Body @{phone="+84391912441"; purpose="register"} `
    -ExpectedStatus 400

# Test 3: Send OTP for password reset (non-existent user)
Test-Endpoint `
    -Name "Send OTP (Reset - No User)" `
    -Method "POST" `
    -Endpoint "/api/auth/send-otp" `
    -Body @{phone=$testPhone; purpose="reset-password"} `
    -ExpectedStatus 404

# Test 4: Send OTP for password reset (existing user)
Test-Endpoint `
    -Name "Send OTP (Reset - Valid User)" `
    -Method "POST" `
    -Endpoint "/api/auth/send-otp" `
    -Body @{phone="+84391912441"; purpose="reset-password"}

# Test 5: Verify OTP (wrong code)
Test-Endpoint `
    -Name "Verify OTP (Wrong Code)" `
    -Method "POST" `
    -Endpoint "/api/auth/verify-otp" `
    -Body @{phone=$testPhone; otp="000000"; purpose="register"} `
    -ExpectedStatus 400

# Test 6: Login (wrong password)
Test-Endpoint `
    -Name "Login (Wrong Password)" `
    -Method "POST" `
    -Endpoint "/api/auth/login" `
    -Body @{phone="+84391912441"; password="WrongPass"} `
    -ExpectedStatus 401

# Test 7: Login (success)
$loginResponse = Test-Endpoint `
    -Name "Login (Success)" `
    -Method "POST" `
    -Endpoint "/api/auth/login" `
    -Body @{phone="+84391912441"; password="Admin@123"}

$token = $null
if ($loginResponse -and $loginResponse.token) {
    $token = $loginResponse.token
    Write-Host "`n  Token saved for protected endpoints" -ForegroundColor Green
}

# ========================================
# TASK #29: AUTHENTICATION MIDDLEWARE TESTS
# ========================================

Write-Host "`n`n========================================" -ForegroundColor Yellow
Write-Host "  TASK #29: AUTHENTICATION MIDDLEWARE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Yellow

# Test 8: Access protected endpoint without token
Test-Endpoint `
    -Name "Get Current User (No Token)" `
    -Method "GET" `
    -Endpoint "/api/auth/me" `
    -ExpectedStatus 401

# Test 9: Access protected endpoint with invalid token
Test-Endpoint `
    -Name "Get Current User (Invalid Token)" `
    -Method "GET" `
    -Endpoint "/api/auth/me" `
    -Headers @{Authorization="Bearer invalid_token_here"} `
    -ExpectedStatus 401

# Test 10: Access protected endpoint with valid token
if ($token) {
    Test-Endpoint `
        -Name "Get Current User (Valid Token)" `
        -Method "GET" `
        -Endpoint "/api/auth/me" `
        -Headers @{Authorization="Bearer $token"}
}

# Test 11: Get user profile
if ($token) {
    Test-Endpoint `
        -Name "Get User Profile" `
        -Method "GET" `
        -Endpoint "/api/users/profile" `
        -Headers @{Authorization="Bearer $token"}
}

# Test 12: Update user profile
if ($token) {
    Test-Endpoint `
        -Name "Update User Profile" `
        -Method "PUT" `
        -Endpoint "/api/users/profile" `
        -Headers @{Authorization="Bearer $token"} `
        -Body @{name="Admin Updated"}
}

# Test 13: Get all users (admin only)
if ($token) {
    Test-Endpoint `
        -Name "Get All Users (Admin)" `
        -Method "GET" `
        -Endpoint "/api/users" `
        -Headers @{Authorization="Bearer $token"}
}

# ========================================
# AUTHORIZATION TESTS (RBAC)
# ========================================

Write-Host "`n`n========================================" -ForegroundColor Yellow
Write-Host "  AUTHORIZATION (RBAC) TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Yellow

# Create a regular user to test authorization
Write-Host "`n[INFO] Creating test user for RBAC..." -ForegroundColor Yellow
$testUserPhone = "+84" + (Get-Random -Minimum 100000000 -Maximum 999999999)

# Send OTP for test user
$otpResponse = Test-Endpoint `
    -Name "Send OTP for Test User" `
    -Method "POST" `
    -Endpoint "/api/auth/send-otp" `
    -Body @{phone=$testUserPhone; purpose="register"}

# Extract OTP from response (development mode only)
$testOtp = $null
if ($otpResponse -and $otpResponse.otp) {
    $testOtp = $otpResponse.otp
    Write-Host "`n  Test OTP: $testOtp" -ForegroundColor Green
    
    # Register test user
    $registerResponse = Test-Endpoint `
        -Name "Register Test User" `
        -Method "POST" `
        -Endpoint "/api/auth/register" `
        -Body @{
            phone=$testUserPhone
            name="Test User"
            password="Test@123"
            role="user"
            otp=$testOtp
        }
    
    $userToken = $null
    if ($registerResponse -and $registerResponse.token) {
        $userToken = $registerResponse.token
        
        # Test 14: Regular user trying to access admin endpoint
        Test-Endpoint `
            -Name "Get All Users (Regular User - Should Fail)" `
            -Method "GET" `
            -Endpoint "/api/users" `
            -Headers @{Authorization="Bearer $userToken"} `
            -ExpectedStatus 403
    }
}

# ========================================
# SUMMARY
# ========================================

Write-Host "`n`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nTotal Tests: $($passed + $failed)" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "`nSuccess Rate: $([math]::Round(($passed / ($passed + $failed)) * 100, 2))%" -ForegroundColor Yellow

if ($failed -eq 0) {
    Write-Host "`n✅ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "`nTask #29 (Auth Middleware): READY FOR REVIEW" -ForegroundColor Cyan
    Write-Host "Task #30 (API Endpoints): READY FOR REVIEW" -ForegroundColor Cyan
}
else {
    Write-Host "`n❌ SOME TESTS FAILED" -ForegroundColor Red
    Write-Host "Please review failed tests above" -ForegroundColor Yellow
}

Write-Host "`n========================================`n" -ForegroundColor Cyan

# Return exit code based on test results
exit $failed

