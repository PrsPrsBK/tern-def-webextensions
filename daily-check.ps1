
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


