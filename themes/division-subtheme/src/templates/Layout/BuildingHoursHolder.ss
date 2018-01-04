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

		<article role="main" class="main-content main-content--with-padding <% if $SiteConfig.ShowExitButton %>main-content--with-exit-button-padding<% end_if %> <% if $Children || $Menu(2) || $SidebarBlocks ||  $SidebarView.Widgets %>main-content--with-sidebar<% else %>main-content--full-width<% end_if %>">
			$BlockArea(BeforeContentConstrained)
			<div class="main-content__text">
				<%-- $Content --%>
				
					
					<div class="main-content__text">
						<%-- $Content --%>

						<% with $ActiveHoursPages.First %>
							<h2>$Title</h2>
							<% if $EffectiveStartDate && $EffectiveEndDate %>
								<p><em>Effective from $EffectiveStartDate.NiceUS - $EffectiveEndDate.NiceUS</em></p>
							<% end_if %>

							<div>
								<p>Jump to:</p>
								<ul>
									<% loop $Children %>
										<li><a href="#{$URLSegment}">$Title</a></li>
									<% end_loop %>
								</ul>
							</div>
							<% loop $Children %>
								<h3 id="$URLSegment">$Title</h3>
								<table>
									<tr>
										<th>Day</th>
										<th>Hours</th>
									</tr>
									<tr>
										<td>Monday</td>
										<% if $MonClosedAllDay %>
											<td><strong>Closed</strong></td>
										<% else_if $MonOpenAllDay %>
											<td><strong>Open 24 Hours</strong></td>
										<% else %>
											<td>$MonOpenTime.Nice - $MonCloseTime.Nice</td>
										<% end_if %>

									</tr>
									<tr>
										<td>Tuesday</td>
										<% if $TuesClosedAllDay %>
											<td><strong>Closed</strong></td>
										<% else_if $TuesOpenAllDay %>
											<td><strong>Open 24 Hours</strong></td>
										<% else %>
											<td>$TuesOpenTime.Nice - $TuesCloseTime.Nice</td>
										<% end_if %>

									</tr>
									<tr>
										<td>Wednesday</td>
										<% if $WedClosedAllDay %>
											<td><strong>Closed</strong></td>
										<% else_if $WedOpenAllDay %>
											<td><strong>Open 24 Hours</strong></td>
										<% else %>
											<td>$WedOpenTime.Nice - $WedCloseTime.Nice</td>
										<% end_if %>
									</tr>
									<tr>
										<td>Thursday</td>
										<% if $ThursClosedAllDay %>
											<td><strong>Closed</strong></td>
										<% else_if $ThursOpenAllDay %>
											<td><strong>Open 24 Hours</strong></td>
										<% else %>
											<td>$ThursOpenTime.Nice - $ThursCloseTime.Nice</td>
										<% end_if %>
									</tr>
									<tr>
										<td>Friday</td>
										<% if $FriClosedAllDay %>
											<td><strong>Closed</strong></td>
										<% else_if $FriOpenAllDay %>
											<td><strong>Open 24 Hours</strong></td>
										<% else %>
											<td>$FriOpenTime.Nice - $FriCloseTime.Nice</td>
										<% end_if %>
									</tr>
									<tr>
										<td>Saturday</td>
										<% if $SatClosedAllDay %>
											<td><strong>Closed</strong></td>
										<% else_if $SatOpenAllDay %>
											<td><strong>Open 24 Hours</strong></td>
										<% else %>
											<td>$SatOpenTime.Nice - $SatCloseTime.Nice</td>
										<% end_if %>
									</tr>
									<tr>
										<td>Sunday</td>
										<% if $SunClosedAllDay %>
											<td><strong>Closed</strong></td>
										<% else_if $SunOpenAllDay %>
											<td><strong>Open 24 Hours</strong></td>
										<% else %>
											<td>$SunOpenTime.Nice - $SunCloseTime.Nice</td>
										<% end_if %>
									</tr>
								</table>
								<% if $Exceptions %>
									<em>Exceptions: $Exceptions </em>
								<% end_if %>
							<% end_loop %>
						<% end_with %>
					</div>					

			
					
			</div>
			$BlockArea(AfterContentConstrained)
			$Form
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
