<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    protected string $cloudName;
    protected string $apiKey;
    protected string $apiSecret;

    public function __construct()
    {
        $this->cloudName = config('cloudinary.cloud_name', env('CLOUDINARY_CLOUD_NAME', 'bql6cjkw'));
        $this->apiKey = config('cloudinary.api_key', env('CLOUDINARY_API_KEY', '449385166713163'));
        $this->apiSecret = config('cloudinary.api_secret', env('CLOUDINARY_API_SECRET', 'zxvSVbvwVzXU-zlw6CcUzH2WRiU'));
    }

    /**
     * Upload an image file or base64 data to Cloudinary.
     *
     * @param UploadedFile|string $file
     * @param string $folder e.g. 'luyenthi/questions', 'luyenthi/avatars'
     * @return array ['url' => string, 'public_id' => string, 'format' => string]
     */
    public function upload(UploadedFile|string $file, string $folder = 'luyenthi/questions'): ?array
    {
        $timestamp = time();
        $paramsToSign = [
            'folder' => $folder,
            'timestamp' => $timestamp,
        ];
        ksort($paramsToSign);

        $signString = '';
        foreach ($paramsToSign as $k => $v) {
            $signString .= "{$k}={$v}&";
        }
        $signString = rtrim($signString, '&') . $this->apiSecret;
        $signature = sha1($signString);

        $url = "https://api.cloudinary.com/v1_1/{$this->cloudName}/image/upload";

        try {
            if ($file instanceof UploadedFile) {
                $response = Http::attach(
                    'file',
                    file_get_contents($file->getRealPath()),
                    $file->getClientOriginalName()
                )->post($url, [
                    'api_key' => $this->apiKey,
                    'timestamp' => $timestamp,
                    'folder' => $folder,
                    'signature' => $signature,
                ]);
            } else {
                $response = Http::post($url, [
                    'file' => $file,
                    'api_key' => $this->apiKey,
                    'timestamp' => $timestamp,
                    'folder' => $folder,
                    'signature' => $signature,
                ]);
            }

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'url' => $data['secure_url'] ?? $data['url'],
                    'public_id' => $data['public_id'],
                    'format' => $data['format'] ?? 'jpg',
                    'bytes' => $data['bytes'] ?? 0,
                ];
            }

            Log::error('Cloudinary upload error:', ['body' => $response->body()]);
            return null;
        } catch (\Throwable $e) {
            Log::error('Cloudinary exception:', ['message' => $e->getMessage()]);
            return null;
        }
    }
}
