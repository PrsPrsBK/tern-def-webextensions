
Param(
  [Parameter(Position = 0, Mandatory = $true)]
  [ValidateScript({
    if(-Not (Test-Path $_) -Or (Resolve-Path $_).Provider.Name -ne "FileSystem") {
      throw "Please specify valid mozilla-xxx repository path : '$_'"
    }
    return $true
  })]
  [string]$mozillaRepo,
  [switch]$SkipFetch,
  [switch]$ShowIncoming
)

Begin {
  Get-Command hg -ErrorAction:Ignore | Out-Null
  if($? -eq $false) {
    throw "hg does not exist on the PATH."
  }
  if($SkipFetch) {
    Write-Host "Skip 1st phase: no fetch from remote." -ForegroundColor Cyan
  }
  else {
    $goPull = $true
    if($ShowIncoming) {
      $hg_proc = (Start-Process -FilePath "hg" -ArgumentList "incoming -R $mozillaRepo --quiet" -NoNewWindow -Wait -PassThru)
      Wait-Process -Id $hg_proc.id
      # System.Diagnostics.Process.ExitCode with -Wait is necessary. $LASTEXITCODE does not work.
      if($hg_proc.ExitCode -eq 0) {
        [ValidateSet("y","n")]$yn = Read-Host "incomings may exist. hg pull -u? [y/n]"
        if($yn -eq "y") {
          $goPull = $true
        }
        else {
          $goPull = $false
          Write-Host "not 'yes', so nothing pulled. "
        }
      }
      else {
        $goPull = $false
        Write-Host "nothing to pull. hg ExitCode: $($hg_proc.ExitCode)"
      }
      $hg_proc = $null
    }
    if($goPull) {
      Start-Process -FilePath "hg" -ArgumentList "pull -u -R $mozillaRepo" -NoNewWindow -PassThru | Wait-Process
    }
  }
  Write-Host "Next phase: check if we need to update or not." -ForegroundColor Cyan
}

Process {
  $script_path =  (Split-Path -Parent $MyInvocation.MyCommand.Path)
  $cset_pubed =  (Join-Path -Path $script_path -ChildPath "cset_pubed.log")
  $cset_today =  (Join-Path -Path $script_path -ChildPath "cset.log")
  $separator = "================================================================================"

  New-Item $cset_today -ItemType File -Force | Out-Null
  Start-Job -ArgumentList $mozillaRepo, $cset_today -ScriptBlock {
    Param($repo, $log)
    hg log -l 3 -R $repo -I (Join-Path -Path $repo -ChildPath "/toolkit/components/extensions/schemas/*.json") -X (Join-Path -Path $repo -ChildPath "/toolkit/components/extensions/schemas/manifest.json") --removed --template status `
    | Add-Content $log
  } | Wait-Job | Receive-Job | Remove-Job

  $separator | Add-Content $cset_today

  Start-Job -ArgumentList $mozillaRepo, $cset_today -ScriptBlock {
    Param($repo, $log)
    hg log -l 3 -R $repo -I (Join-Path -Path $repo -ChildPath "/browser/components/extensions/schemas/*.json") --removed --template status `
    | Add-Content $log
  } | Wait-Job | Receive-Job | Remove-Job

  $separator | Add-Content $cset_today

  Start-Job -ArgumentList $MozillaRepo, $cset_today -ScriptBlock {
    Param($repo, $log)
    hg log -l 3 -R $repo -I (Join-Path -Path $repo -ChildPath "/toolkit/components/extensions/schemas/manifest.json") --removed --template status `
    | Add-Content $log
  } | Wait-Job | Receive-Job | Remove-Job

  if(Test-Path -Path $cset_pubed) {
    if(Compare-Object (Get-Content $cset_pubed) (Get-Content $cset_today)) {
      Write-Host "Result: May need to UPDATE!!!!!!!!!!!" -ForegroundColor Magenta
    }
    else {
      Write-Host "Result: no change added." -ForegroundColor Green
    }
  }
  else {
    Write-Host "Result: first time."
    Copy-Item $cset_today $cset_pubed
  }
}

End {
}

# vim:expandtab ff=dos fenc=utf-8 sw=2
