<div class="module events">
	<div class="inner">
		<h3>Events Listed at the IMU</h3>
		<% with $LocalistCalendar %>
			<% if $EventList %>
			<div class="event-list">
				<% loop $EventList.Limit(4) %>
					<div class="event">
						<h4><a href="$AfterClassLink" target="_blank">  $Title.LimitCharacters(30) </a></h4>
						<p><% include LocalistDatesNoLinks %>&nbsp;- $Content.Summary(5) <a target="_blank" href="$AfterClassLink">Continue Reading</a></p>
					</div>
				<% end_loop %>
			</div>
			<% end_if %>
		<% end_with %>
		<p><a href="http://events.uiowa.edu/iowa_memorial_union/calendar" target="_blank">See all events happening at the IMU</a></p>
	</div>
</div>