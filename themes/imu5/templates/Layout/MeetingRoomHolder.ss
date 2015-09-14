<% if $BackgroundImage %>
	<div class="img-container" style="background-image: url($BackgroundImage.URL);">
		<div class="img-fifty-top"></div>
	</div>
<% end_if %>
<div class="gradient">
	<div class="container clearfix">
		<div class="white-cover"></div>
		 <section class="main-content <% if $BackgroundImage %>margin-top<% end_if %>">
			$Content
			$Form
			<ul class="justify MeetingRoomList">
				<% loop $Children %>

					<li class="item">
						<a href="$Link">
							<img src="$SlideshowImage1.croppedImage(300,200).URL" alt="$Title">
							<h3 class="title">$Title</h3>
							<p class="room-capacity">
								<span class="capacity"><strong>Capacity: </strong>$DisplayCapacity</span>
								<% if $Number %><span class="room"><strong>Room #</strong>$Number</span><% end_if %>
							</p>

							<!--
							<% if $TablesAndChairsCapacity %>$TablesAndChairsCapacity<% end_if %>
							<% if $RoundedTablesCapacity %>$RoundedTablesCapacity<% end_if %>
							<% if $TheaterCapacity %>$TheaterCapacity<% end_if %>
							<% if $ClassroomCapacity %>$ClassroomCapacity<% end_if %>
							<% if $UshapeCapacity %>$UshapeCapacity<% end_if %>
							<% if $BoardroomCapacity %>$BoardroomCapacity<% end_if %>
							-->
							
						 </a>
					</li>&nbsp;

				<% end_loop %>
					<li class="item filler"></li>
			</ul>
		 </section>
		 <section class="sec-content hide-print">
			<% include SideNav %>
		 </section>
	</div>
</div>
<% include TopicsAndNews %>

