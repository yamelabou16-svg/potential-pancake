$port = 8080
$htmlPath = "$PSScriptRoot\out"
if (-not (Test-Path $htmlPath)) {
    Write-Error "No se encontro la carpeta 'out'. Asegurate de compilar la app primero."
    exit
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
    Write-Host "Servidor de MyWealth Pro iniciado en http://localhost:$port"
    Start-Process "http://localhost:$port/"
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        if ($urlPath -eq "/_next") { $response.Close(); continue }
        $filePath = Join-Path $htmlPath $urlPath
        
        # If it's a directory, check if index.html exists
        if (Test-Path $filePath -PathType Container) {
            $filePath = Join-Path $filePath "index.html"
        }
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Set correct mime type
            if ($filePath -match '\.html$') { $response.ContentType = "text/html; charset=utf-8" }
            elseif ($filePath -match '\.js$') { $response.ContentType = "application/javascript" }
            elseif ($filePath -match '\.css$') { $response.ContentType = "text/css" }
            elseif ($filePath -match '\.png$') { $response.ContentType = "image/png" }
            elseif ($filePath -match '\.jpg$') { $response.ContentType = "image/jpeg" }
            elseif ($filePath -match '\.svg$') { $response.ContentType = "image/svg+xml" }
            elseif ($filePath -match '\.json$') { $response.ContentType = "application/json" }
            
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            # Check if it has a file extension; if not, try appending .html for next.js static routes
            if ($urlPath -notmatch '\.[a-zA-Z0-9]+$') {
                $altPath = $filePath + ".html"
                if (Test-Path $altPath -PathType Leaf) {
                    $bytes = [System.IO.File]::ReadAllBytes($altPath)
                    $response.ContentType = "text/html; charset=utf-8"
                    $response.ContentLength64 = $bytes.Length
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                    $response.Close()
                    continue
                }
            }
            # Serve 404 page
            $notFoundPath = Join-Path $htmlPath "404.html"
            if (Test-Path $notFoundPath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($notFoundPath)
                $response.ContentType = "text/html; charset=utf-8"
                $response.StatusCode = 404
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
            }
        }
        $response.Close()
    }
} catch {
    Write-Host "Error en el servidor: $_"
} finally {
    $listener.Close()
}
