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
	<em><strong>Exceptions:</strong> $Exceptions </em>
<% end_if %>