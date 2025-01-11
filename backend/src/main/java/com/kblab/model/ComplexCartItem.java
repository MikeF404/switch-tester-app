@Entity
@Table(name = "complex_cart_items")
public class ComplexCartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "complex_item_seq")
    @SequenceGenerator(name = "complex_item_seq", initialValue = 300, allocationSize = 1)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "cart_id")
    private Cart cart;
    
    @ManyToOne
    @JoinColumn(name = "tester_id")
    private SwitchTester switchTester;
    
    private boolean includesKeycaps;
    private Integer quantity;
    
    // Constructors, getters, setters
} 