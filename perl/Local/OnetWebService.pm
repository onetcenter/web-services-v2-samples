package Local::OnetWebService;
use strict;
use warnings 'FATAL' => 'all';
no warnings 'redefine';

=head1 NAME

Local::OnetWebService - Connect to O*NET Web Services

=cut

BEGIN {

  use Exporter ();
  
  our @ISA = ('Exporter');
  our @EXPORT = ();
  our @EXPORT_OK = ();
  our %EXPORT_TAGS = ();
  
  our $VERSION = '2.00';
  
  use LWP::UserAgent ();
  use URI ();
  use MIME::Base64 ();
  use JSON ();
}

=head1 USAGE

=over 4

=item C<new($username, $password)>

Provide the credentials assigned from the O*NET Web Services site.

=cut

sub new
{
  my ($class, $api_key) = @_;
  
  my $ua = LWP::UserAgent->new();
  $ua->default_header('X-API-Key' => $api_key);
  $ua->default_header('Accept' => 'application/json');
  $ua->timeout(10);
  $ua->agent('perl-OnetWebService/' . $Local::OnetWebService::VERSION . ' (bot)');
  
  my $self = bless { 'ua' => $ua }, $class;
  $self->set_version();
  
  return $self;
}

=item C<set_version($version)>

To use a version-specific API, call this with the version string, such as "1.9".
To use the default version, call with no argument.

=cut

sub set_version
{
  my ($self, $version) = @_;
  
  unless (defined $version) {
    $self->{'url_root'} = 'https://api-v2.onetcenter.org/';
  } else {
    $self->{'url_root'} = 'https://api-v' . $version . '.onetcenter.org/';
  }
}

=item C<call($path, @query_options)>

Example:

    $service->call('online/search', 'keyword' => 'architect');

=cut

sub call
{
  my ($self, $path, @query) = @_;
  
  my $uri = URI->new($self->{'url_root'} . $path);
  if (scalar @query) {
    $uri->query_form(\@query);
  }
  my $url = $uri->as_string();
  my $resp = $self->{'ua'}->get($url);
  if (($resp->header('Client-Warning') || '') eq 'Internal response') {
    return { 'error' => 'Internal error: ' . $resp->message,
             'lwp_info' => $resp };
  }
  if ($resp->code != 200 && $resp->code != 422) {
    return { 'error' => 'Call to ' . $url .  ' failed with error code ' . $resp->code,
             'lwp_info' => $resp };
  }
  return JSON::decode_json($resp->content());
}

=back

=cut

1;
