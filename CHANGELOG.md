# v0.2.0 (2018-11-07)

* Load single orders from the Hermes endpoint for single orders, instead of
  selecting from a collection by order ID.
* Load orders only once per click, instead of twice per click, on the order
  history / profile page.
* On the order history page, before the user's orders are actually loaded, show
  a spinner instead of the "You have no orders" message.

# v0.1.0 (2018-10-16)

* Add changelog (see [Pull Requests
  #1-#40](https://bitbucket.org/nsidc/everest-ui/pull-requests/?state=MERGED)
  for details on additional changes that are part of this version)
* Add "Client-Id" header to CMR requests, with value
  `nsidc-everest-$environment`
* Display the UI version below the globe widget
* Use `everest-ui` share instead of `hermes` share
* Do a CMR status check before making any other CMR requests. If it is down,
  display a banner and retry the status check every 60 seconds.
* Deployment details are included in README.
* Order buttons have a tooltip with instructions for when the order is
  complete. If the user is logged out, the tooltips instruct the user to log in.
* Order buttons are disabled when not logged into Earthdata.
* Add spinner to show when granules are loading.
* Only render the "Collection Dropdown" in the "standalone" app, not in Drupal
* When in Drupal, use Drupal''s dataset id and version.
* Simplify the state and properties passed down the component hierarchy.
* Workaround unknown CMR version length by padding, e.g.: `&version_id=6&version_id=06&version_id=006`
* Extract the collection dropdown from the main part of the application and update CSS to add some basic responsiveness.
* Animate the GranuleList when loading
* Help text now rearranges to a single column when browser is narrow.
* Tooltips over order buttons now have a width that corresponds to the button's
  width.
* Allow editing polygon selection points by click-and-drag
* Allow editing polygon selection points by lon/lat input
* Show selected collection's coverage at the same time as the polygon
* Save the user's temporal and spatial parameters to `localStorage`, reloading
  and applying those filters when the user returns. Only the parameters for a
  single dataset are saved; if another dataset's page is visited, the saved
  filters are cleared.
