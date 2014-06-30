<% if $BackgroundImage %>
	<div class="img-container" style="background-image: url($BackgroundImage.URL);">
		<div class="img-fifty-top"></div>
	</div>
<% end_if %>
<div class="gradient">
	<div class="container clearfix">
		<div class="white-cover"></div>
		 <section class="main-content <% if $BackgroundImage %>margin-top<% end_if %>">
		 	<div class="meeting-page">

		 		<% if SlideshowImage2 %>
					<div class="flexslider">
						<ul class="slides">
							<% if SlideshowImage1 %><li><img src="$SlideshowImage1.URL" alt="$Title"></li><% end_if %>
							<% if SlideshowImage2 %><li><img src="$SlideshowImage2.URL" alt="$Title"></li><% end_if %>
							<% if SlideshowImage3 %><li><img src="$SlideshowImage3.URL" alt="$Title"></li><% end_if %>
							<% if SlideshowImage4 %><li><img src="$SlideshowImage4.URL" alt="$Title"></li><% end_if %>
						</ul>
					</div>
				<% else %>
					<img src="$SlideshowImage1.URL" alt="$Title">
				<% end_if %>

				<h1 class="name">$Title</h1>

				<% if Number %><p class="number">Room #$Number</p><% end_if %>
				$Content
				$Form

				<div class="meeting-page-details clearfix">
					<div class="item first capacity">
						<h4 class="title">Capacity by Setup</h4>
						<div class="">
							<% if TablesAndChairsCapacity %>
								<p>
									<!-- <span><img src="$ThemeDir/images/table_icon.png"></span> -->
									<strong>Tables &amp; Chairs:</strong> $TablesAndChairsCapacity
								</p>
							 <% end_if %>
							 <% if RoundedTablesCapacity %>
								<p>
									<!-- <span><img src="$ThemeDir/images/round_table_icon.png"></span> -->
									<strong>Rounded Tables:</strong> $RoundedTablesCapacity
								</p>
							 <% end_if %>
							 <% if TheaterCapacity %>
								<p>
									<!-- <span><img src="$ThemeDir/images/theater_icon.png"></span>  -->
									<strong>Theater:</strong> $TheaterCapacity
								</p>
							 <% end_if %>
							 <% if ClassroomCapacity %>
								<p>
									<!-- <span><img src="$ThemeDir/images/classroom_icon.png"></span> -->
									<strong>Classroom:</strong> $ClassroomCapacity
								</p>
							 <% end_if %>
							 <% if UshapeCapacity %>
								<p>
									<!-- <span><img src="$ThemeDir/images/ushape_icon.png"></span> -->
									<strong>U-Shape:</strong> $UshapeCapacity
								</p>
							 <% end_if %>
							 <% if BoardroomCapacity %>
								<p>
									<!-- <span><img src="$ThemeDir/images/boardroom_icon.png" width="24"></span> -->
									<strong>Board Room:</strong> $BoardroomCapacity
								</p>
							 <% end_if %>
						</div>
				  </div>


					<div class="item equipment ">
						<h4 class="title">Equipment</h4>
						<div>
							<% if HasComputer %>
								<p>
								 	<!-- <span><img src="$ThemeDir/images/computer_icon.png" height="24"></span> -->
								 	Computer
								</p>
							<% end_if %>
							<% if HasEthernetConnection %>
								<p>
									<!-- <span><img src="$ThemeDir/images/ethernet_connection_icon.png" width="24"></span> -->
									Ethernet Connection
								</p>
							<% end_if %>
							<% if HasProjectorScreen %>
								<p>
									<!-- <span><img src="$ThemeDir/images/projector_icon.png" width="24"></span> -->
									Projector Screen
								</p>
							<% end_if %>
							<% if HasDVD %>
								<p>
									<!-- <span><img src="$ThemeDir/images/dvd_vcr.png" height="24"></span> -->
									DVD Player
								</p>
							<% end_if %>
							<% if HasSpeakers %>
								<p>
									<!-- <span><img src="$ThemeDir/images/speakers_icon.png" height="24"></span> -->
									Speakers
								</p>
							<% end_if %>
							<% if HasMarkerboard %>
								<p>
									<!-- <span><img src="$ThemeDir/images/markerboard_icon.png" height="24"></span> -->
									Markerboard
								</p>
							<% end_if %>
							<% if HasMicrophone %>
								<p>
									<!-- <span><img src="$ThemeDir/images/microphone_icon.png" height="24"></span> -->
									Microphone
								</p>
							<% end_if %>
							<% if HasWifi %>
								<p>
									<!-- <span><img src="$ThemeDir/images/wifi_icon.png" height="24"></span> -->
									Wifi
								</p>
							<% end_if %>
						</div>
					</div>


					<div class="item last rates">
						<h4 class="title">Rates</h4>
						<% if StudentRate %>
							<p>
								<strong>Student Organizations</strong><br>
							 	<span class="dolla_dolla_bill">
							 		<span class="sign">$</span>$StudentRate
							 	</span>
							</p>
						<% else %>
							<p>
								<strong>Student Organizations</strong><br>
							 	<span class="dolla_dolla_bill">
							 		<span class="sign">$0</span>
							 	</span>
							</p>
						<% end_if %>

						<% if FacultyRate %>
							<p>
								<strong>Faculty Departments</strong><br>
								<span class="dolla_dolla_bill">
									<span class="sign">$</span>$FacultyRate
								</span>
							</p>
						<% else %>
							<p>
								<strong>Faculty Departments</strong><br>
								<span class="dolla_dolla_bill">
									<span class="sign">$0</span>
								</span>
							</p>
						<% end_if %>

						<% if GeneralRate %>
							<p>
								<strong>General Public</strong><br>
								<span class="dolla_dolla_bill">
									<span class="sign">$</span>$GeneralRate
								</span>
							</p>
						<% else %>
							<p>
								<strong>General Public</strong><br>
								<span class="dolla_dolla_bill">
									<span class="sign">$0</span>
								</span>
							</p>
						<% end_if %>
					</div>

				</div>

				<div class="well">
					<% if InSection("spaces") %>
						<p>Make a reservation for this space by calling 319-335-3114 or emailing <a href="mailto:imu-eventservices@uiowa.edu">imu-eventservices@uiowa.edu</a>.</p>
					<% else %>
						<a href="event-services/reservations/" class="btn">Make a reservation</a>
					<% end_if %>
				</div>

				<% if StandardCapacity %>
					<p class="standard_setup_notice">
						* denotes a room's standard setup. The non-standard setup fee is $40.
					</p>
				<% end_if %>

			</div>
		</section>
		<section class="sec-content hide-print">
			<% include SideNav %>
		</section>
	</div>
</div>
<% include TopicsAndNews %>

