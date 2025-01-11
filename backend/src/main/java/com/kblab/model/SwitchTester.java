@Entity
@Table(name = "switch_testers")
public class SwitchTester {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private boolean isPreset;
    private BigDecimal basePrice;
    private boolean includesKeycaps;
    
    @ManyToMany
    @JoinTable(
        name = "tester_switches",
        joinColumns = @JoinColumn(name = "tester_id"),
        inverseJoinColumns = @JoinColumn(name = "switch_id")
    )
    private Set<Switch> switches = new HashSet<>();
    
    // Constructors
    public SwitchTester() {}
    
    public SwitchTester(String name, boolean isPreset, BigDecimal basePrice, boolean includesKeycaps) {
        this.name = name;
        this.isPreset = isPreset;
        this.basePrice = basePrice;
        this.includesKeycaps = includesKeycaps;
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isPreset() {
        return isPreset;
    }

    public void setPreset(boolean isPreset) {
        this.isPreset = isPreset;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public boolean isIncludesKeycaps() {
        return includesKeycaps;
    }

    public void setIncludesKeycaps(boolean includesKeycaps) {
        this.includesKeycaps = includesKeycaps;
    }

    public Set<Switch> getSwitches() {
        return switches;
    }

    public void setSwitches(Set<Switch> switches) {
        this.switches = switches;
    }
} 