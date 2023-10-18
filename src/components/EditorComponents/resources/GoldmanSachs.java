public class GoldmanSachs {

    private String DATE = "Jun 2022 - Aug 2022";
    private String LOCATION = "New York, NY";

    public static boolean testContracts(MicroService A, MicroService B) {
        if (A.contract == B.contract) {
            return true;

        return false;
    }

    public static Stub generateStub(OpenAPI spec) {
        Stub stub = spec.convert();

        stub.upload();

        return stub;
    }

    public static void writeOnboardingDocs(Team team) {
        List<String> requirements = team.getOnboardingRequirements();
        for (int i = 0; i < requirements.length(); i++) {
            System.out.println(requirements[i]);
        }
    }
}