# v0.1.0 (Unreleased)

* Add changelog (see [Pull Requests
  #1-#40](https://bitbucket.org/nsidc/everest-ui/pull-requests/?state=MERGED)
  for details on additional changes that are part of this version)
* Add "Client-Id" header to CMR requests, with value
  `nsidc-everest-$environment`
* Display the UI version below the globe widget
* Use `everest-ui` share instead of `hermes` share
* Incorporate Earthdata UI CSS.
* Do a CMR status check before making any other CMR requests. If it is down,
  display a banner and retry the status check every 60 seconds.
* Deployment details are included in README.
* Order buttons have a tooltip with instructions for when the order is complete.
* Order buttons are disabled when not logged into Earthdata.
* Only render the "Collection Dropdown" in the "standalone" app, not in Drupal
* When in Drupal, use Drupal's dataset id and version.
* Simplify the state and properties passed down the component hierarchy.
