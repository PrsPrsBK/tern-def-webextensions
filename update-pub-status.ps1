<#
 # @fileoverview run as postpublish.
 # 1. update defs/which_is_used.txt
 # @author PrsPrsBK
#>

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
}

Process {
  $script_path =  (Split-Path -Parent $MyInvocation.MyCommand.Path)
  $cset_pubed =  (Join-Path -Path $script_path -ChildPath "cset_pubed.log")
  $cset_today =  (Join-Path -Path $script_path -ChildPath "cset.log")
  $which_is_used =  (Join-Path -Path $script_path -ChildPath "defs/which_is_used.txt")

  Start-Job -ArgumentList $mozilla_repo, $which_is_used -ScriptBlock {
    Param($repo, $log)
    hg log -l 1 -R $repo --template "mozilla-beta changeset: {rev}:{node}" > $log
  } | Wait-Job | Receive-Job | Remove-Job

}

End {
}

# vim:expandtab ff=dos fenc=utf-8 sw=2

