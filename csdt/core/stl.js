// TODO Move this function over to seperate module since it is completely new functionality
export function saveAndExportAsSTL(name) {
  var projectBody, projectSize;

  this.confirm(
    localize("You need to save first. Are you sure you want to replace") +
      '\n"' +
      name +
      '"?',
    "STL Export",
    () => {
      if (name) {
        this.setProjectName(name);
      }
      this.showMessage("Saving project\nto the cloud...");
      projectBody = this.buildProjectRequest();
      projectSize = this.verifyProject(projectBody);
      if (!projectSize) {
        return;
      } // Invalid Projects don't return anything.
      this.showMessage(
        "Uploading " + Math.round(projectSize / 1024) + " KB..."
      );
      this.cloud.saveProject(
        this.getProjectName(),
        projectBody,
        (data) => {
          this.showMessage("saved.", 2);
          this.cloud.updateURL(data.id);
          this.cloud.project_id = data.id;
          this.cloud.project_approved = data.approved;
          this.recordSavedChanges();
          this.controlBar.updateLabel();
          // let projectID = parseInt(window.location.pathname.match(/projects\/(\d+)/)[1])
          window.onbeforeunload = nop;
          this.showMessage("exporting as STL...", 2);
          window.location.pathname = `/stl/${this.cloud.project_id}`;
          window.onbeforeunload = (evt) => {
            var e = evt || window.event,
              msg = "Are you sure you want to leave?";
            // For IE and Firefox
            if (e) {
              e.returnValue = msg;
            }
            // For Safari / chrome
            return msg;
          };
        },
        this.cloudError()
      );
    }
  );
}

export function launchSTLPrompt() {
  let myself = this;

  new DialogBoxMorph(null, myself.sendVisualizerData).promptSTLDownload(
    "STL Download",
    "signup",
    null,
    null,
    null,
    null,
    "check to make the call to the \nvisualizer",
    world,
    null,
    null
  );
}
