<div class="module events">
	<div class="inner">
		<h3>Events Listed at the IMU</h3>
		<% with Page("calendar") %>
			<% if EventList %>
			<div class="event-list">
				<% loop EventList.Limit(4) %>
					<div class="event">
						<h4><a href="$LocalistLink" target="_blank">  $Title </a></h4>
						<p><% include LocalistDatesNoLinks %></p>
					</div>
				<% end_loop %>
			</div>
			<% end_if %>
		<% end_with %>
		<p><a href="http://afterclass.uiowa.edu/" target="_blank">See More Events on After Class</a></p>
	</div>
</div>