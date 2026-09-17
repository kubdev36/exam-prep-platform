<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    protected CloudinaryService $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    /**
     * Upload an image to Cloudinary.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|max:10240', // max 10MB
            'folder' => 'nullable|string',
        ]);

        $folder = $request->input('folder', 'luyenthi/questions');
        $result = $this->cloudinary->upload($request->file('file'), $folder);

        if (!$result) {
            return response()->json([
                'message' => 'Tải ảnh lên Cloudinary không thành công. Vui lòng kiểm tra lại.',
            ], 500);
        }

        return response()->json([
            'message' => 'Tải ảnh lên thành công',
            'data' => $result,
        ]);
    }
}
