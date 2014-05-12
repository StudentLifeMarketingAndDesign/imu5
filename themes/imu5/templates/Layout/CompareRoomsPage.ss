
<% if $BackgroundImage %>
	<div class="img-container" style="background-image: url($BackgroundImage.URL);">
		<div class="img-fifty-top"></div>
	</div>
<% end_if %>
	<div class="gradient">
		<div class="page-full-width">
			<div class="container clearfix">
				<div class="white-cover"></div>
				 <section class="main-content <% if $BackgroundImage %>margin-top<% end_if %>">

					$Content
					$Form

					<% with $Page(meetings) %>

						<table class="responsive-table">
						<thead>
							<tr>
								<th scope="col">Room</th>
								<th scope="col">Capacity</th>
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
									<th scope="row"><a href="$Link">$Title</a></th>
									<td data-title="Capacity">$DisplayCapacity</td>
									<td data-title="Computer"><% if HasComputer %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="Ethernet"><% if HasEthernetConnection %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="Projector"><% if HasProjectorScreen %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="DVD"><% if HasDVD %>x <% else %>&nbsp;<% end_if %></td>
									<td data-title="Speakers"><% if HasSpeakers %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="Markerboard"><% if HasMarkerboard %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="Microphone"><% if HasMicrophone %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="WiFi"><% if HasWifi %>&#10003;<% else %>&nbsp;<% end_if %></td>
								</tr>
							<% end_loop %>
						</tbody>
					</table>
					<% end_with %>

				 </section>
			</div>
		</div>
	</div>
<% include TopicsAndNews %>

