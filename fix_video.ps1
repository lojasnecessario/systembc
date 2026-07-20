Write-Host "Extracting FFmpeg with tar..."
mkdir ffmpeg_ext -Force
tar -xf ffmpeg.zip -C ffmpeg_ext

$ffmpegPath = Get-ChildItem -Path "ffmpeg_ext" -Filter "ffmpeg.exe" -Recurse | Select-Object -First 1

Write-Host "Re-encoding video..."
& $ffmpegPath.FullName -y -i "PS5_controller_neon_shapes_linear_202607161300.mp4" -g 1 -an "public\hero_video.mp4"

Write-Host "Cleaning up..."
Remove-Item -Path "ffmpeg.zip" -Force
Remove-Item -Path "ffmpeg_ext" -Recurse -Force

Write-Host "Done!"
