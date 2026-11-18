@props(['url'])
{{-- Logo blanc sur bandeau taupe ; PNG car les messageries n'affichent pas le SVG. --}}
<tr>
<td class="header" align="center">
<a href="{{ $url }}" style="display: inline-block;">
<img src="{{ asset('images/logo-dym-blanc.png') }}" class="logo" width="108" height="60" alt="{{ trim($slot) }}">
</a>
</td>
</tr>
