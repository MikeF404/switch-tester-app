@Entity
@Table(name = "simple_cart_items")
public class SimpleCartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "simple_item_seq")
    @SequenceGenerator(name = "simple_item_seq", initialValue = 100, allocationSize = 1)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "cart_id")
    private Cart cart;
    
    @ManyToOne
    @JoinColumn(name = "item_id")
    private SimpleItem item;
    
    private Integer quantity;
    
    // Constructors, getters, setters
    public SimpleCartItem() {}

    public SimpleCartItem(Cart cart, SimpleItem item, Integer quantity) {
        this.cart = cart;
        this.item = item;
        this.quantity = quantity;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
  
    }

    public SimpleItem getItem() {
        return item;
    }

    public void setItem(SimpleItem item) {
        this.item = item;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
} 