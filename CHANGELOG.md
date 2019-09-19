# v1.0.6 (2019-09-17)

* Change Order History page to a table of orders.

# v1.0.5 (2019-09-16)

* Force start/end dates to the beginning and end of the day,
  to get all of the granules.

# v1.0.4 (2019-08-22)

* Include credentials in `getOrder` function, which accesses the hermes-api
  endpoint `/api/orders/<order_id>`. If credentials are not explicitly included,
  some browsers (e.g., Firefox 60.8.0esr) do not include cookies in the request,
  resulting in a 401 Unauthorized response.

# v1.0.3 (2019-08-08)

* Stop rounding bounding box coordinates from CMR. This ensures that our
  bounding box encompasses the data, fixing a bug where all of the HMA_Snowfield
  point data was excluded by our box.

# v1.0.2 (2019-07-29)

* Change default granule sort order to start-time-descending (latest at top).

# v1.0.1 (2019-06-26)

* Tweaks to Earthdata Search tooltip and dialog text.

# v1.0.0 (2019-06-25)

* Add a third button to take user to Earthdata.

# v0.22.0 (2019-06-20)

* Close Earthdata Search dialog when user downloads the Python script.

# v0.21.0 (2019-06-20)

* Close Earthdata Search dialog when user hits OK.

# v0.20.0 (2019-06-19)

* UI tweaks, add table border.

# v0.19.0 (2019-06-19)

* Add gutter between main columns, and add a resize handle.

# v0.18.0 (2019-06-18)

* New Earthdata Search handoff functionality for orders >2000 granules
* Add ability to sort granule columns.

# v0.17.0 (2019-06-05)

* Change default granule sorting to ascending by date.

# v0.16.0 (2019-06-03)

* Display message in profile page when user is logged out.

# v0.15.0 (2019-05-30)

* Ensure that the latlon box remains visible while editing.
* Add note to Order page that zip files may take a moment to start.

# v0.14.0 (2019-05-28)

* On the Order History page make sure URLs wrap correctly.
* Add the total order size (in MB etc.) to the file list and confirmation dialog.

# v0.13.0 (2019-05-21)

* Support multiple EGI zips in Hermes API responses

# v0.12.0 (2019-05-20)

* Change Script button to download a Python script.
* Change Script button to not require logging in (since the script does that).
* Remove default double click handler to avoid Cesium crash with global datasets

# v0.11.0 (2019-04-30)

* Stop passing the 'api' version string to `/order-proxy`; the Drupal module
  manages this so we don't have to

# v0.10.0 (2019-04-30)

* Update Hermes communication such that the notification endpoint is the only
  thing using `/apps/orders`; all others go through `/order-proxy` (ie, Drupal)
  * removed any communication via `/script-proxy`

# v0.9.0 (2019-04-22)

* Parse of responses from hermes-api v5
    * the response can include multiple zip / file_url.archive links, but we
      continue to only render one on the order history page for now
* Parse websocket messages from hermes-notfication v4

# v0.8.0 (2019-04-09)

* Minor UI tweaks, use font-awesome icons, add granule search reset button,
  change 'granule' to 'file'.
* Improve Cesium performance - only redraw when a property/polygon is updated.

# v0.7.0 (2019-03-20)

* Add text filter for granule IDs.

# v0.6.0 (2019-03-18)

* Merge list-of-links and zip buttons into one -- ESI provides both for free.
* Display file links and zip link separately on order history page
  * This was done in a hacky way that won't work once we enable dataproducts
    which contain .zip files. We plan to address this with the database switch.

# v0.5.0 (2019-03-12)

* Switch to use /apps/orders/notification2 endpoint for websockets. This will
  need to be reverted.

# v0.4.0 (2019-03-11)

* Add Cesium logo beneath the globe widget
* Parse ZIP links by files ending in ".zip", rather than matching the Hermes
  order ID; this is necessary for ZIP links from ESI orders, which do not
  include the Hermes order IDs in their filenames.
* Update Hermes-related URLs and data for hermes-api v4
  * use `/api-v4/` rather than `/api/`
  * access hermes-api v4 via the "hermes2" stack in "dev" (other environments
    require change in the data downloads Drupal module)
  * Add `uid` field to JSON submitted in POST requests to Hermes for new orders
  * Change `granule_URs` to `selection_critera.include_granules` for submitting
    orders
  * Replace `destination` and `format` fields with `fulfillment` and `delivery`
    for new orders
  * parse ISO datestring from `timestamp` field rather than UNIX date from
    `date` field
* Stop loading 10,000 granules; limit previews and orders to 2,000 granules, as
  that is the limit on EGI.
  * Update the warning message to reflect the new limit, and change the box from
    red with white text to yellow with black text.

# v0.3.0 (2018-12-19)

* Minor CSS changes based on internal user feedback
  * change granule count color from blue to dark grey
  * adjust positioning of order buttons
  * tweak header of granule table
* Hide lonlat edit box if it's empty, show when displaying lonlat
* After reload from `localStorage`, fly to last-known camera position
  when polygon was created or edited.
* When creating a polygon, don't lose points--fix bug where moving the mouse
  slowly after clicking would sometimes lose the point that should have just
  been created by clicking (easiest to see in Safari)
* Whitelist datasets for standalone mode: MOD10A2, MYD10A2, and NISE
* Fix issue where when reloading a polygon from `localStorage`, the points
  render as white instead of the desired crimson.
* Allow setting dates with MM/DD/YYYY format or M/D/YYYY
* After a CMR error, display an error banner, gray out the app; when the
  user dismisses the banner restore CMR functionality
* Add temporal reset button
* Add time error messages for illegal dates

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
