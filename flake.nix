{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { nixpkgs, self, flake-utils, ... }: flake-utils.lib.eachDefaultSystem (system:
    let pkgs = nixpkgs.legacyPackages.${system}; in
    {
      devShells.default = pkgs.mkShell {
        packages = with pkgs; [nodejs];
        shellHook = ''exec zsh'';
      };
      packages.default = pkgs.buildNpmPackage {
        dontNpmBuild = true;
        name = "cuff2ics";
        npmDepsHash = "sha256-3wOzdhf3x+jMgG+aqhj/RXJsOxpX/CrsiI8O2HrX7A4=";
        src = ./.;
      };
      apps.default = {
	      type = "app";
	      program = "${self.packages."${system}".default}/lib/node_modules/rdfa2ttl/index.js";
      };
    });
}
