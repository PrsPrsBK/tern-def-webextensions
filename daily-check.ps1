
Param(
  [Parameter(Position = 0, Mandatory = $true)]
  [ValidateScript({
    if((Resolve-Path $_).Provider.Name -ne "FileSystem") {
       throw "Please specify mozilla-xxx repository path : '$_'"
    }
    return $true
  })]
  [string]$mozilla_repo
)

Begin {
  $hg_proc = (Start-Process -FilePath "hg" -ArgumentList "incoming -R $mozilla_repo --quiet" -NoNewWindow -PassThru)
  Wait-Process -Id $hg_proc.id
  if($LASTEXITCODE -eq 1) {
    Write-Host "Nothing to pull."
  }
  else {
    $yn = Read-Host "There are incoming. hg pull -u? [y/n]"
    if($yn -eq "y") {
      $hg_proc = (Start-Process -FilePath "hg" -ArgumentList "pull -u -R $mozilla_repo" -NoNewWindow -PassThru)
      Wait-Process -Id $hg_proc.id
    }
  }
}

Process {
  Push-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

  $hg_proc = (Start-Process -FilePath "hg" -ArgumentList "log -l 3 -R $mozilla_repo -I", (Join-Path -Path $mozilla_repo -ChildPath "/toolkit/components/extensions/schemas/*.json"), "--removed --template status" -NoNewWindow -PassThru)
  Wait-Process -Id $hg_proc.id

  $hg_proc = (Start-Process -FilePath "hg" -ArgumentList "log -l 3 -R $mozilla_repo -I", (Join-Path -Path $mozilla_repo -ChildPath "/browser/components/extensions/schemas/*.json"), "--removed --template status" -NoNewWindow -PassThru)
  Wait-Process -Id $hg_proc.id

  Pop-Location
}

End {
}


