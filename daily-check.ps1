
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
  Get-Command hg -ErrorAction:Ignore | Out-Null
  if($? -eq $false) {
    throw "hg does not exist on the PATH."
  }
  $hg_proc = (Start-Process -FilePath "hg" -ArgumentList "incoming -R $mozilla_repo --quiet" -NoNewWindow -PassThru)
  Wait-Process -Id $hg_proc.id
  if($LASTEXITCODE -eq 0) {
    $yn = Read-Host "incomings may exist. hg pull -u? [y/n]"
    if($yn -eq "y") {
        $hg_proc = (Start-Process -FilePath "hg" -ArgumentList "pull -u -R $mozilla_repo" -NoNewWindow -PassThru)
        Wait-Process -Id $hg_proc.id
    }
  }
  else {
    Write-Host "nothing to pull."
  }
  $hg_proc = $null
}

Process {
  $script_path =  (Split-Path -Parent $MyInvocation.MyCommand.Path)
  $cset_pubed =  (Join-Path -Path $script_path -ChildPath "cset_pubed.log")
  $cset_today =  (Join-Path -Path $script_path -ChildPath "cset.log")

  Start-Job -ArgumentList $mozilla_repo, $cset_today -ScriptBlock {
    Param($repo, $log)
    hg log -l 3 -R $repo -I (Join-Path -Path $repo -ChildPath "/toolkit/components/extensions/schemas/*.json") --removed --template status > $log
  } | Wait-Job | Receive-Job | Remove-Job

  Start-Job -ArgumentList $mozilla_repo, $cset_today -ScriptBlock {
    Param($repo, $log)
    # append !!!!!!!!!
    hg log -l 3 -R $repo -I (Join-Path -Path $repo -ChildPath "/browser/components/extensions/schemas/*.json") --removed --template status >> $log
  } | Wait-Job | Receive-Job | Remove-Job

  if(Test-Path -Path $cset_pubed) {
    if(Compare-Object (Get-Content $cset_pubed) (Get-Content $cset_today)) {
      Write-Host "May need to UPDATE!!!!!!!!!!!"
    }
    else {
      Write-Host "no change added."
    }
  }
  else {
    Write-Host "first time"
    Copy-Item $cset_today $cset_pubed
  }
}

End {
}


