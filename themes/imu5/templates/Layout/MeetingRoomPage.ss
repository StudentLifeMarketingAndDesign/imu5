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

		 		<% if SlideshowImage1 || SlideshowImage2 || SlideshowImage3 || $SlideshowImage4 || $SlideshowImage5 || $SlideshowImage6 || $SlideshowImage7 || $SlideshowImage8 %>
					<div class="flexslider">
						<ul class="slides">
							<% if SlideshowImage1 %><li><img src="$SlideshowImage1.CroppedImage(760, 506).URL" alt="$Title"></li><% end_if %>
							<% if SlideshowImage2 %><li><img src="$SlideshowImage2.CroppedImage(760, 506).URL" alt="$Title"></li><% end_if %>
							<% if SlideshowImage3 %><li><img src="$SlideshowImage3.CroppedImage(760, 506).URL" alt="$Title"></li><% end_if %>
							<% if SlideshowImage4 %><li><img src="$SlideshowImage4.CroppedImage(760, 506).URL" alt="$Title"></li><% end_if %>
							<% if SlideshowImage5 %><li><img src="$SlideshowImage5.CroppedImage(760, 506).URL" alt="$Title"></li><% end_if %>
							<% if SlideshowImage6 %><li><img src="$SlideshowImage6.CroppedImage(760, 506).URL" alt="$Title"></li><% end_if %>
							<% if SlideshowImage7 %><li><img src="$SlideshowImage7.CroppedImage(760, 506).URL" alt="$Title"></li><% end_if %>
							<% if SlideshowImage8 %><li><img src="$SlideshowImage8.CroppedImage(760, 506).URL" alt="$Title"></li><% end_if %>
						</ul>
					</div>
				<% else %>
					<img src="$SlideshowImage1.CroppedImage(760, 506).URL" alt="$Title">
				<% end_if %>
				$Breadcrumbs
				<h1 class="name">$Title</h1>

				<% if Number %><p class="number">Room #$Number</p><% end_if %>
				$Content
				$Form

				
				<div class="meeting-page-details clearfix">
					<% if TablesAndChairsCapacity || RoundedTablesCapacity || TheaterCapacity || ClassroomCapacity || UshapeCapacity || BoardroomCapacity %>
					<div class="item first capacity">
						<h4 class="title">Capacity by setup</h4>
						<div class="">
							<% if TablesAndChairsCapacity %>
							<p>
								<!-- <span><img src="$ThemeDir/images/table_icon.png"></span> -->
								<strong>Banquet Rectangles:</strong> $TablesAndChairsCapacity
							</p>
							<% end_if %>
							<% if RoundedTablesCapacity %>
							<p>
								<!-- <span><img src="$ThemeDir/images/round_table_icon.png"></span> -->
								<strong>Banquet Rounds:</strong> $RoundedTablesCapacity
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
					<% end_if %>
				 

				  	<% if HasComputer || HasEthernetConnection || HasProjectorScreen || HasDVD || HasSpeakers || HasMarkerboard || HasMicrophone || HasWifi || HasElectricPiano|| ComplimentaryEquipmentProvided %>
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
									Ethernet connection
								</p>
							<% end_if %>
							<% if HasProjectorScreen %>
								<p>
									<!-- <span><img src="$ThemeDir/images/projector_icon.png" width="24"></span> -->
									Projector screen
								</p>
							<% end_if %>
							<% if HasDVD %>
								<p>
									<!-- <span><img src="$ThemeDir/images/dvd_vcr.png" height="24"></span> -->
									DVD player
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
							<% if HasElectricPiano %>
								<p>
									<!-- <span><img src="$ThemeDir/images/wifi_icon.png" height="24"></span> -->
									Electric piano
								</p>
							<% end_if %>
							<% if ComplimentaryEquipmentProvided %>
								<p>
									<!-- <span><img src="$ThemeDir/images/wifi_icon.png" height="24"></span> -->
									Complimentary items*
								</p>
							<% end_if %>
						</div>
					</div>
					<% end_if %>

					<% if StudentRate || FacultyRate || GeneralRate %>
					<div class="item last rates">
						<h4 class="title">Rates</h4>
						<% if StudentRate %>
							<p>
								<strong>Student organizations</strong><br>
							 	<span class="dolla_dolla_bill">
							 		$StudentRate
							 	</span>
							</p>
						<% end_if %>

						<% if FacultyRate %>
							<p>
								<strong>Faculty departments</strong><br>
								<span class="dolla_dolla_bill">
									$FacultyRate
								</span>
							</p>
						<% end_if %>

						<% if GeneralRate %>
							<p>
								<strong>General public</strong><br>
								<span class="dolla_dolla_bill">
									$GeneralRate
								</span>
							</p>
						<% end_if %>
					</div>
					<% end_if %>

				</div>
				<div class="well">

					<% if InSection("spaces") %>
						<p>Make a reservation for this space by calling 319-335-3114 or emailing <a href="mailto:imu-eventservices@uiowa.edu">imu-eventservices@uiowa.edu</a>.</p>
					<% else %>
						<a href="event-services/reservations/" class="btn">Make a reservation</a>
					<% end_if %>
				</div>


				<% if ComplimentaryEquipmentProvided %>
					<p>*Some items are provided in fee rooms in limited amounts for no charge: for a full list see our <a href="event-services/fees/"> A/V, Equipment, and Services page.  </p></a>
				<% end_if %>

				<% if StandardCapacity %>
					<p class="standard_setup_notice">
						* denotes a room's standard setup. The non-standard setup fee is 
						<strong><% if $URLSegment == "northwestern-room" || $URLSegment == "ohio-state-room" %>{$DollarSign}80<% else %>{$DollarSign}40<% end_if %></strong>.
					</p>
				<% end_if %>
				<% if ShowRoomLayout %>
				<h2>Available setups for {$Title}:</h2>
				<ul class="justify MeetingRoomList room-setups">

					
					<% if TablesAndChairsCapacity %>
					<li class="item">
						<img src="{$ThemeDir}/images/room-setups/tables.png" alt="tables">
						<h3 class="title">Banquet Rectangles</h3>
						<p class="room-capacity">
							<strong> Capacity: </strong> $TablesAndChairsCapacity
						</p>
						
					</li>&nbsp;
					<% end_if %>

					<% if RoundedTablesCapacity %>
					<li class="item">

							<img src="{$ThemeDir}/images/room-setups/roundTables.png" alt="roundTables">

						<h3 class="title">Banquet Rounds</h3>
						<p class="room-capacity">
							<strong> Capacity: </strong> $RoundedTablesCapacity
						</p>
					
					</li>&nbsp;
					<% end_if %>

					<% if TheaterCapacity %>
					<li class="item">

							<img src="{$ThemeDir}/images/room-setups/theater.png" alt="theater">

						<h3 class="title">Theater</h3>
						<p class="room-capacity">
							<strong> Capacity: </strong> $TheaterCapacity
						</p>
					
					</li>&nbsp;
					<% end_if %>

					<% if ClassroomCapacity %>
					<li class="item">

							<img src="{$ThemeDir}/images/room-setups/classroom.png" alt="classroom">

						<h3 class="title">Classroom</h3>
						<p class="room-capacity">
							<strong> Capacity: </strong> $ClassroomCapacity
						</p>
					
					</li>&nbsp;
					<% end_if %>								

					<% if UshapeCapacity %>
					<li class="item">

						<img src="{$ThemeDir}/images/room-setups/Ushape.png" alt="Ushape">
						<h3 class="title">U-Shape</h3>
						<p class="room-capacity">
							<strong> Capacity: </strong> $UshapeCapacity
						</p>
					
					</li>&nbsp;
					<% end_if %>

					<% if BoardroomCapacity %>
					<li class="item">
						<img src="{$ThemeDir}/images/room-setups/boardRoom.png" alt="boardRoom">
						<h3 class="title">Board Room</h3>
						<p class="room-capacity">
							<strong> Capacity: </strong> $BoardroomCapacity
						</p>
					
					</li>&nbsp;
					<% end_if %>

					<li class="item filler"></li>
				</ul>
				<% end_if %>


			</div>
		</section>
		<section class="sec-content hide-print">
			<% include SideNav %>
		</section>
	</div>
</div>
<% include TopicsAndNews %>

