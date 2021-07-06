$Header
<main class="main-content__container" id="main-content__container">

	<!-- Background Image Feature -->
	<% if $BackgroundImage %>
		<% include FeaturedImage %>
	<% end_if %>
	
	<% if not $BackgroundImage %>
		<div class="column row">
	        <div class="main-content__header">
	            $Breadcrumbs
				<h1>$Title</h1>
			</div>
		</div>
	<% end_if %>

	$BeforeContent

	<div class="row">

		<div class="main-content main-content--with-padding main-content--full-width" style="width: 100%">
			$BeforeContentConstrained
			<% if $MainImage %>
				<img class="main-content__main-img" src="$MainImage.ScaleMaxWidth(500).URL" alt="" role="presentation"/>
			<% end_if %>
			<div class="main-content__text">
				$Content
	            $AfterContentConstrained
	            $Form
				<% with $Page(meetings) %>

						<table class="responsive-table">
						<thead class="dp-sticky">
							<tr>
								<th scope="col">Room</th>
								<th scope="col">Capacity</th>
								<th scope="col">Set up</th>
								<th scope="col">Computer</th>
								<th scope="col">Ethernet</th>
								<th scope="col">Projector</th>
								<th scope="col">DVD</th>
								<th scope="col">Speakers</th>
								<th scope="col">Markerboard</th>
								<th scope="col">Microphone</th>
								<th scope="col">WiFi</th>
							</tr>
						</thead>
						<tbody>
							<% loop $Children %>
								<tr>
									<th scope="row"><a href="$Link" style="text-decoration: underline;">$Title</a></th>
									<td data-title="Capacity">$DisplayCapacity</td>
									<td data-title="Set up(s)">
										<ul style="margin-bottom: 0; font-size: 13px;">
											<% if $LayoutCount == 1 %>
												<% if $TablesAndChairsCapacity %>
													<li>Banquet Rectangles</li>
												<% end_if %>
												<% if $RoundedTables %>
													<li>Banquet Rounds</li>
												<% end_if %>
												<% if $TheaterCapacity %>
													<li>Theater</li>
												<% end_if %>
												<% if $ClassroomCapacity %>
													<li>Classroom</li>
												<% end_if %>
												<% if $UshapeCapacity %>
													<li>U-Shape</li>
												<% end_if %>
												<% if $BoardroomCapacity %>
													<li>Board Room</li>
												<% end_if %>
											<% else %>
												<li>Flexible</li>
											<% end_if %>

										</ul>
									</td>
									<td data-title="Computer" class="text-center"><% if HasComputer %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="Ethernet" class="text-center"><% if HasEthernetConnection %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="Projector" class="text-center"><% if HasProjectorScreen %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="DVD" class="text-center"><% if HasDVD %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="Speakers" class="text-center"><% if HasSpeakers %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="Markerboard" class="text-center"><% if HasMarkerboard %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="Microphone" class="text-center"><% if HasMicrophone %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="WiFi" class="text-center"><% if HasWifi %>&#10003;<% else %>&nbsp;<% end_if %></td>
								</tr>
							<% end_loop %>
						</tbody>
					</table>
					<% end_with %>
			</div>
			<% if $ShowChildPages %>
				<% include ChildPages %>
			<% end_if %>
		</div>
	</div>
$AfterContent


</main>