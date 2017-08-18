$Header
<main class="main-content__container" id="main-content__container">

	<!-- Background Image Feature -->
	<% if $BackgroundImage %>
		<% include FeaturedImage %>
	<% end_if %>
	$Breadcrumbs

<% if not $BackgroundImage %>
	<div class="column row">
		<div class="main-content__header">
			<h1>$Title</h1>
		</div>
	</div>
<% end_if %>

$BlockArea(BeforeContent)

<div class="row">
	<article role="main" class="main-content main-content--with-padding <% if $Children || $Menu(2) || $SidebarBlocks ||  $SidebarView.Widgets %>main-content--with-sidebar<% else %>main-content--full-width<% end_if %>">
		$BlockArea(BeforeContentConstrained)
		<div class="main-content__text">
		 		<% if $SlideshowImage1 || $SlideshowImage2 || $SlideshowImage3 || $SlideshowImage4 || $SlideshowImage5 || $SlideshowImage6 || $SlideshowImage7 || $SlideshowImage8 %>


					<div class="slideshow">
			
						<div class="slideshow__slide">
							<% if SlideshowImage1 %>
								<img class="slideshow__img" data-flickity-lazyload="$SlideshowImage1.FocusFill(840, 525).URL" width="840" height="525" alt="" role="presentation" />
							<% end_if %>
						</div>
						<% if SlideshowImage2 %>
							<div class="slideshow__slide">
								<img class="slideshow__img" data-flickity-lazyload="$SlideshowImage2.FocusFill(840, 525).URL" width="840" height="525" alt="" role="presentation" />
							</div>
						<% end_if %>
						<% if SlideshowImage3 %>
							<div class="slideshow__slide">
								<img class="slideshow__img" data-flickity-lazyload="$SlideshowImage3.FocusFill(840, 525).URL" width="840" height="525" alt="" role="presentation" />
							</div>
						<% end_if %>		
						<% if SlideshowImage4 %>
							<div class="slideshow__slide">
								<img class="slideshow__img" data-flickity-lazyload="$SlideshowImage4.FocusFill(840, 525).URL" width="840" height="525" alt="" role="presentation" />
							</div>
						<% end_if %>				
						<% if SlideshowImage5 %>
							<div class="slideshow__slide">
								<img class="slideshow__img" data-flickity-lazyload="$SlideshowImage5.FocusFill(840, 525).URL" width="840" height="525" alt="" role="presentation" />
							</div>
						<% end_if %>
						<% if SlideshowImage6 %>
							<div class="slideshow__slide">
								<img class="slideshow__img" data-flickity-lazyload="$SlideshowImage6.FocusFill(840, 525).URL" width="840" height="525" alt="" role="presentation" />
							</div>
						<% end_if %>
						<% if SlideshowImage7 %>
							<div class="slideshow__slide">
								<img class="slideshow__img" data-flickity-lazyload="$SlideshowImage7.FocusFill(840, 525).URL" width="840" height="525" alt="" role="presentation" />
							</div>
						<% end_if %>
						<% if SlideshowImage8 %>
							<div class="slideshow__slide">
								<img class="slideshow__img" data-flickity-lazyload="$SlideshowImage8.FocusFill(840, 525).URL" width="840" height="525" alt="" role="presentation" />
							</div>
						<% end_if %>																	
					</div>
				<% else_if $SlideshowImage1 %>
					<img src="$SlideshowImage1.CroppedImage(760, 506).URL" alt="$Title">
				<% end_if %>
			
				<h1>$Title</h1>

				<% if $Number %><p>Room #$Number</p><% end_if %>
				<div class="room-single__info">
					$Content
				</div>
				$Form

				
				<div class="room-single__details">
					<% if $TablesAndChairsCapacity || $RoundedTablesCapacity || $TheaterCapacity || $ClassroomCapacity || $UshapeCapacity || $BoardroomCapacity %>
						<h2>Capacity by setup</h2>
						
							<% if $TablesAndChairsCapacity %>
							<p>
								<!-- <span><img src="$ThemeDir/images/table_icon.png"></span> -->
								<strong>Banquet Rectangles:</strong> $TablesAndChairsCapacity
							</p>
							<% end_if %>
							<% if $RoundedTablesCapacity %>
							<p>
								<!-- <span><img src="$ThemeDir/images/round_table_icon.png"></span> -->
								<strong>Banquet Rounds:</strong> $RoundedTablesCapacity
							</p>
							<% end_if %>
							<% if $TheaterCapacity %>
							<p>
								<!-- <span><img src="$ThemeDir/images/theater_icon.png"></span>  -->
								<strong>Theater:</strong> $TheaterCapacity
							</p>
							<% end_if %>
							<% if $ClassroomCapacity %>
							<p>
								<!-- <span><img src="$ThemeDir/images/classroom_icon.png"></span> -->
								<strong>Classroom:</strong> $ClassroomCapacity
							</p>
							<% end_if %>
							<% if $UshapeCapacity %>
							<p>
								<!-- <span><img src="$ThemeDir/images/ushape_icon.png"></span> -->
								<strong>U-Shape:</strong> $UshapeCapacity
							</p>
							<% end_if %>
							<% if $BoardroomCapacity %>
							<p>
								<!-- <span><img src="$ThemeDir/images/boardroom_icon.png" width="24"></span> -->
								<strong>Board Room:</strong> $BoardroomCapacity
							</p>
							<% end_if %>
						
			
					<% end_if %>
				 

				  	<% if $HasComputer || $HasEthernetConnection || $HasProjectorScreen || $HasDVD || $HasSpeakers || $HasMarkerboard || $HasMicrophone || $HasWifi || $HasElectricPiano|| $ComplimentaryEquipmentProvided %>
				
					
						<h2>Equipment</h2>
					
							<% if $HasComputer %>
								<p>
								 	<!-- <span><img src="$ThemeDir/images/computer_icon.png" height="24"></span> -->
								 	Computer
								</p>
							<% end_if %>
							<% if $HasEthernetConnection %>
								<p>
									<!-- <span><img src="$ThemeDir/images/ethernet_connection_icon.png" width="24"></span> -->
									Ethernet connection
								</p>
							<% end_if %>
							<% if $HasProjectorScreen %>
								<p>
									<!-- <span><img src="$ThemeDir/images/projector_icon.png" width="24"></span> -->
									Projector screen
								</p>
							<% end_if %>
							<% if $HasDVD %>
								<p>
									<!-- <span><img src="$ThemeDir/images/dvd_vcr.png" height="24"></span> -->
									DVD player
								</p>
							<% end_if %>
							<% if $HasSpeakers %>
								<p>
									<!-- <span><img src="$ThemeDir/images/speakers_icon.png" height="24"></span> -->
									Speakers
								</p>
							<% end_if %>
							<% if $HasMarkerboard %>
								<p>
									<!-- <span><img src="$ThemeDir/images/markerboard_icon.png" height="24"></span> -->
									Markerboard
								</p>
							<% end_if %>
							<% if $HasMicrophone %>
								<p>
									<!-- <span><img src="$ThemeDir/images/microphone_icon.png" height="24"></span> -->
									Microphone
								</p>
							<% end_if %>
							<% if $HasWifi %>
								<p>
									<!-- <span><img src="$ThemeDir/images/wifi_icon.png" height="24"></span> -->
									Wifi
								</p>
							<% end_if %>
							<% if $HasElectricPiano %>
								<p>
									<!-- <span><img src="$ThemeDir/images/wifi_icon.png" height="24"></span> -->
									Electric piano
								</p>
							<% end_if %>
							<% if $ComplimentaryEquipmentProvided %>
								<p>
									<!-- <span><img src="$ThemeDir/images/wifi_icon.png" height="24"></span> -->
									Complimentary items*
								</p>
							<% end_if %>
					
					<% end_if %>

					<% if $StudentRate || $FacultyRate || $GeneralRate %>
						<h2>Rates</h2>
						<% if $StudentRate %>
							<p>
								<strong>UI Student organization events</strong><br>
							 	<span class="dolla_dolla_bill">
							 		$StudentRate
							 	</span>
							</p>
						<% end_if %>

						<% if $FacultyRate %>
							<p>
								<strong>UI departmental events</strong><br>
								<span class="dolla_dolla_bill">
									$FacultyRate
								</span>
							</p>
						<% end_if %>

						<% if $GeneralRate %>
							<p>
								<strong>General public events</strong><br>
								<span class="dolla_dolla_bill">
									$GeneralRate
								</span>
							</p>
						<% end_if %>
					<% end_if %>

				</div>
				<div class="well">

					<% if $ContactInfo %>
						<h3>Contact information</h3>
						<p>$ContactInfo</p>
					<% else_if $Parent.ID == 417 %>
						<p>Make a reservation for this space by calling 319-335-3114 or emailing <a href="mailto:imu-eventservices@uiowa.edu">imu-eventservices@uiowa.edu</a>.</p>
					<% else %>
						<a href="event-services/reservations/" class="button button--large">Make a reservation</a>
					<% end_if %>
				</div>


				<% if $ComplimentaryEquipmentProvided %>
					<p>*Some items are provided in fee rooms in limited amounts for no charge: for a full list see our <a href="event-services/fees/"> A/V, Equipment, and Services page.  </p></a>
				<% end_if %>

				<% if $StandardCapacity && $ShowSetupChangeFee && $SetupChangeFee %>
					<p class="standard_setup_notice">
						* denotes a room's standard setup. Minimum setup change fee: 
						<strong>$SetupChangeFee</strong>.
					</p>
				<% end_if %>
				<% if $ShowRoomLayout %>
				<h2>Available setups for {$Title}:</h2>
				<ul class="room-single__setups">

					
					<% if $TablesAndChairsCapacity %>
					<li>
						<img src="{$ThemeDir}/images/room-setups/tables.png" alt="tables">
						<h3>Banquet Rectangles</h3>
						<p>
							<strong> Capacity: </strong> $TablesAndChairsCapacity
						</p>
						
					</li>&nbsp;
					<% end_if %>

					<% if $RoundedTablesCapacity %>
					<li>

							<img src="{$ThemeDir}/images/room-setups/roundTables.png" alt="roundTables">

						<h3>Banquet Rounds</h3>
						<p>
							<strong> Capacity: </strong> $RoundedTablesCapacity
						</p>
					
					</li>&nbsp;
					<% end_if %>

					<% if $TheaterCapacity %>
					<li>

							<img src="{$ThemeDir}/images/room-setups/theater.png" alt="theater">

						<h3>Theater</h3>
						<p>
							<strong> Capacity: </strong> $TheaterCapacity
						</p>
					
					</li>&nbsp;
					<% end_if %>

					<% if $ClassroomCapacity %>
					<li>

							<img src="{$ThemeDir}/images/room-setups/classroom.png" alt="classroom">

						<h3>Classroom</h3>
						<p>
							<strong> Capacity: </strong> $ClassroomCapacity
						</p>
					
					</li>&nbsp;
					<% end_if %>								

					<% if $UshapeCapacity %>
					<li>

						<img src="{$ThemeDir}/images/room-setups/Ushape.png" alt="Ushape">
						<h3>U-Shape</h3>
						<p>
							<strong> Capacity: </strong> $UshapeCapacity
						</p>
					
					</li>&nbsp;
					<% end_if %>

					<% if $BoardroomCapacity %>
					<li>
						<img src="{$ThemeDir}/images/room-setups/boardRoom.png" alt="boardRoom">
						<h3>Board Room</h3>
						<p>
							<strong> Capacity: </strong> $BoardroomCapacity
						</p>
					
					</li>&nbsp;
					<% end_if %>
				</ul>
				<% end_if %>

		</div>
		$BlockArea(AfterContentConstrained)
		$Form
		<% if $ShowChildPages %>
			<% include ChildPages %>
		<% end_if %>
	</article>
	<aside class="sidebar dp-sticky">
		<% include SideNav %>
		<% if $SideBarView %>
			$SideBarView
		<% end_if %>
		$BlockArea(Sidebar)
	</aside>
</div>
$BlockArea(AfterContent)

</main>