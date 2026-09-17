<?php

namespace App\Services\DocumentParser;

use Smalot\PdfParser\Parser;

class PdfExtractor
{
    /**
     * Extract plain text content from a .pdf file.
     *
     * @param string $filePath
     * @return string
     */
    public function extractText(string $filePath): string
    {
        try {
            $parser = new Parser();
            $pdf = $parser->parseFile($filePath);
            $text = $pdf->getText();
            return trim($text);
        } catch (\Throwable $e) {
            return '';
        }
    }
}
