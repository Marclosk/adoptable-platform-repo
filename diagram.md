flowchart TD
%% Nivel 0: Splash y Login
Splash["SplashScreen"]
Login["LoginScreen"]
Register["RegisterScreen"]
ConfirmEmail["ConfirmEmailScreen"]
ForgotPwd["ForgotPasswordScreen"]
ChangePwd["ChangePasswordScreen"]
ResetSuccess["ResetSuccessScreen"]

%% Dashboard común para todos los roles
Dashboard["DashboardScreen\n(BottomNav)"]

%% Flujo inicial
Splash -->|Sesion valida| LoginCheck{Ya logueado?}
LoginCheck -- Si --> Dashboard
LoginCheck -- No --> Login
Splash -->|Sin sesion| Login

%% Login / Registro / Olvidar contrasena
Login -->|Tap Register| Register
Login -->|Tap ForgotPassword| ForgotPwd
Login -->|Login success, replace stack| Dashboard

Register -->|Tap Submit — push| ConfirmEmail
ConfirmEmail -->|Codigo confirmado, replace| Login

ForgotPwd -->|Tap Submit — push| ChangePwd
ChangePwd -->|Tap Submit — push| ResetSuccess
ResetSuccess -->|Back to Login — replace| Login

%% Nivel 1: Dashboard comun (BottomNav con 4 pestaas)
subgraph UserDashboard["DashboardScreen\n(BottomNav)"]
direction TB
HomeTab["HomeTab\n(HomeScreen)"]
DonationsTab["DonationsTab\n(DonationsScreen)"]
ContactTab["ContactUsTab\n(ContactUsScreen)"]
ProfileTab["ProfileTab\n(ProfileScreen)"]
end

Dashboard --> HomeTab
Dashboard --> DonationsTab
Dashboard --> ContactTab
Dashboard --> ProfileTab

%% Enlaces a paneles segun rol
Dashboard -->|Si rol = Protectora ver PanelProtectora| ShelterPanelLink["PanelProtectora"]
Dashboard -->|Si rol = Admin ver PanelAdmin| AdminPanelLink["PanelAdmin"]

%% Nivel 2a: HomeTab
HomeTab -->|Tap Animal — push| AnimalDetail["AnimalDetailScreen"]
AnimalDetail -->|Tap Adoptar — modal| AdoptModal["AdoptionModal"]
AdoptModal -->|Close Modal| AnimalDetail
AnimalDetail -->|Back| HomeTab

%% ViewRequests solo para protectora
AnimalDetail -->|Tap ViewRequests (if Shelter) — push| AdoptionRequests["AdoptionRequestsScreen"]
AdoptionRequests -->|Back| AnimalDetail

%% Nivel 2b: DonationsTab
DonationsTab -->|Tap Donate Now — modal| DonateModal["DonateModalScreen"]
DonateModal -->|Close Modal| DonationsTab

%% Nivel 2c: ContactUsTab
ContactTab -->|Tap Send — modal| ThanksModal["ThanksModal"]
ThanksModal -->|Close Modal| ContactTab

%% Nivel 2d: ProfileTab
ProfileTab -->|Tap MisAnimales — push| AnimalDetail2["AnimalDetailScreen"]
AnimalDetail2 -->|Back| ProfileTab

ProfileTab -->|Tap Edit Profile — push| EditProfile["EditProfileScreen"]
EditProfile -->|Save & Back| ProfileTab

ProfileTab -->|Tap Change Password — modal| ChangePwdModal["ChangePasswordModal"]
ChangePwdModal -->|Close Modal| ProfileTab

ProfileTab -->|Tap Logout — replace| Login

%% Nivel 3a: PanelProtectora
subgraph ShelterSection["PanelProtectora\n(Visible solo para Protectora)"]
direction TB
ShelterHome["ShelterHomeScreen"]
ManageAnimals["ManageAnimalsScreen"]
ShelterDonations["DonationsScreen"]
ShelterContact["ContactUsScreen"]
ShelterProfile["ProfileScreen"]
end

ShelterPanelLink --> ShelterHome
ShelterHome -->|Tap Mis Animales — push| ManageAnimals
ManageAnimals -->|Tap Ver Solicitudes — push| AdoptionRequests  
 AdoptionRequests -->|Back| ManageAnimals

ShelterHome -->|Tap Donaciones — push| ShelterDonations
ShelterDonations -->|Tap Donate Now — modal| ShelterDonateModal["DonateModalScreen"]
ShelterDonateModal -->|Close Modal| ShelterDonations
ShelterDonations -->|Back| ShelterHome

ShelterHome -->|Tap Contacto — push| ShelterContact
ShelterContact -->|Tap Send — modal| ShelterThanksModal["ThanksModal"]
ShelterThanksModal -->|Close Modal| ShelterContact
ShelterContact -->|Back| ShelterHome

ShelterHome -->|Tap Perfil — push| ShelterProfile
ShelterProfile -->|Tap Change Password — modal| ShelterChangePwdModal["ChangePasswordModal"]
ShelterChangePwdModal -->|Close Modal| ShelterProfile
ShelterProfile -->|Tap Edit Profile — push| ShelterEditProfile["EditProfileScreen"]
ShelterEditProfile -->|Save & Back| ShelterProfile
ShelterProfile -->|Tap Logout — replace| Login

%% Nivel 3b: PanelAdmin
subgraph AdminSection["PanelAdmin\n(Visible solo para Admin)"]
direction TB
AdminHome["AdminHomeScreen"]
ManageUsers["ManageUsersScreen"]
ManageShelters["ManageSheltersScreen"]
AdminReports["AdminReportsScreen"]
AdminSettings["AdminSettingsScreen"]
end

AdminPanelLink --> AdminHome
AdminHome -->|Tap Usuarios — push| ManageUsers
AdminHome -->|Tap Protectoras — push| ManageShelters
AdminHome -->|Tap Reportes — push| AdminReports
AdminHome -->|Tap Ajustes — push| AdminSettings
AdminSettings -->|Back| AdminHome
ManageUsers -->|Back| AdminHome
ManageShelters -->|Back| AdminHome
AdminReports -->|Back| AdminHome
AdminHome -->|Tap Logout — replace| Login
