<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'current_exam_code' => 'nullable|string|in:THPT,HSA,TSA',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'STUDENT',
            'current_exam_code' => $validated['current_exam_code'] ?? 'THPT',
            'target_scores' => [
                'THPT' => ['math' => 9.0, 'physics' => 8.5, 'chemistry' => 8.5],
                'HSA' => 110,
                'TSA' => 75,
            ],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký tài khoản thành công',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Thông tin tài khoản hoặc mật khẩu không chính xác.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function updateTarget(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'current_exam_code' => 'nullable|string|in:THPT,HSA,TSA',
            'target_scores' => 'nullable|array',
        ]);

        if (isset($validated['current_exam_code'])) {
            $user->current_exam_code = $validated['current_exam_code'];
        }
        if (isset($validated['target_scores'])) {
            $user->target_scores = $validated['target_scores'];
        }

        $user->save();

        return response()->json([
            'message' => 'Cập nhật mục tiêu thành công',
            'user' => $user,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đã đăng xuất',
        ]);
    }
}
