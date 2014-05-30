<div class="module events">
	<div class="inner">
		<h3>Events Listed at the IMU</h3>
		<% if AfterClassEvents("Iowa Memorial Union") %>
			<div class="event-list">
				<% loop AfterClassEvents("Iowa Memorial Union").Limit(4) %>
					<div class="event">
						<h4><a href="$Link" target="_blank">  $Title </a></h4>
						<p><% include ACDateTime %></p>
					</div>
				<% end_loop %>
			</div>
		<% else %>
			<p>There are currently <strong>no events</strong> listed on the IMU website right now. <% if AfterClassEvents %>Check out some other events on campus: <% end_if %></p>
			<% if AfterClassEvents %>
				<div class="event-list">
					<% loop AfterClassEvents.Limit(4) %>
						<div class="event">
							<h4><a href="$Link" target="_blank"> $Title </a></h4>
							<p><% include ACDateLocation %></p>
						</div>
					<% end_loop %>
				</div>				
			<% end_if %>
		<% end_if %>
		<p>See More Events on <a href="http://afterclass.uiowa.edu/" target="_blank">After Class</a></p>
	</div>
</div>