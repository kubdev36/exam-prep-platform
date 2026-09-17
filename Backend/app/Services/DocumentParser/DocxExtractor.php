<?php

namespace App\Services\DocumentParser;

use ZipArchive;

class DocxExtractor
{
    /**
     * Extract plain text content from a .docx file.
     *
     * @param string $filePath
     * @return string
     */
    public function extractText(string $filePath): string
    {
        $zip = new ZipArchive();
        if ($zip->open($filePath) !== true) {
            return '';
        }

        $xmlIndex = $zip->locateName('word/document.xml');
        if ($xmlIndex === false) {
            $zip->close();
            return '';
        }

        $xmlData = $zip->getFromIndex($xmlIndex);
        $zip->close();

        if (empty($xmlData)) {
            return '';
        }

        // Replace paragraph tags with newlines
        $xmlData = preg_replace('/<\/w:p>/i', "\n", $xmlData);
        $xmlData = preg_replace('/<w:br\/>/i', "\n", $xmlData);
        $xmlData = preg_replace('/<w:tab\/>/i', "\t", $xmlData);

        // Strip remaining XML tags
        $text = strip_tags($xmlData);

        // Clean extra blank lines
        $text = html_entity_decode($text, ENT_QUOTES | ENT_XML1, 'UTF-8');
        return trim($text);
    }
}
