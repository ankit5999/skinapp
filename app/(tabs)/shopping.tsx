import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react-native';
import { useApp } from '../../contexts/AppContext';
import { Header } from '../../components/Header';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { products } from '../../constants/dummyData';
import Animated, { FadeInRight, FadeIn } from 'react-native-reanimated';

export default function ShoppingScreen() {
  const { cart, addToCart, updateCartQuantity, removeFromCart } = useApp();
  const [showCart, setShowCart] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  const cartTotal = cart.reduce((total, item) => {
    const product = products.find((p) => p.id === item.productId);
    return total + (product?.price || 0) * item.quantity;
  }, 0);

  const handleAddToCart = (productId: string) => {
    addToCart(productId);
    Alert.alert('Added to Cart', 'Product has been added to your cart');
  };

  const handleCheckout = () => {
    setShowComingSoonModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, !showCart && styles.tabActive]}
          onPress={() => setShowCart(false)}
        >
          <Text style={[styles.tabText, !showCart && styles.tabTextActive]}>
            Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, showCart && styles.tabActive]}
          onPress={() => setShowCart(true)}
        >
          <Text style={[styles.tabText, showCart && styles.tabTextActive]}>
            Cart ({cart.length})
          </Text>
        </TouchableOpacity>
      </View>

      {!showCart ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Skincare Products</Text>
          <Text style={styles.sectionSubtitle}>
            Professional products for your skin health
          </Text>

          <View style={styles.productsGrid}>
            {products.map((product, index) => (
              <Animated.View
                key={product.id}
                entering={FadeInRight.delay(index * 100)}
                style={styles.productCard}
              >
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productCategory}>{product.category}</Text>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDescription} numberOfLines={2}>
                    {product.description}
                  </Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>
                      ${product.price.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddToCart(product.id)}
                    >
                      <ShoppingCart
                        size={20}
                        color={colors.surface}
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Shopping Cart</Text>

          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <ShoppingCart size={64} color={colors.textMuted} strokeWidth={1.5} />
              <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
              <Text style={styles.emptyCartText}>
                Add some products to get started
              </Text>
            </View>
          ) : (
            <>
              {cart.map((item, index) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return null;

                return (
                  <Animated.View
                    key={item.productId}
                    entering={FadeIn.delay(index * 100)}
                  >
                    <View style={styles.cartItem}>
                      <Image
                        source={{ uri: product.image }}
                        style={styles.cartItemImage}
                      />
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>{product.name}</Text>
                        <Text style={styles.cartItemPrice}>
                          ${product.price.toFixed(2)}
                        </Text>
                        <View style={styles.quantityContainer}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() =>
                              updateCartQuantity(item.productId, item.quantity - 1)
                            }
                          >
                            <Minus size={16} color={colors.text} strokeWidth={2} />
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{item.quantity}</Text>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() =>
                              updateCartQuantity(item.productId, item.quantity + 1)
                            }
                          >
                            <Plus size={16} color={colors.text} strokeWidth={2} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeFromCart(item.productId)}
                      >
                        <Trash2 size={20} color={colors.error} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                );
              })}

              <View style={styles.totalContainer}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalValue}>${cartTotal.toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Shipping</Text>
                  <Text style={styles.totalValue}>Free</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                  <Text style={styles.grandTotalLabel}>Total</Text>
                  <Text style={styles.grandTotalValue}>
                    ${cartTotal.toFixed(2)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}

      <Modal
        visible={showComingSoonModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowComingSoonModal(false)}
      > 
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeIn} style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowComingSoonModal(false)}
            >
              <X size={24} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.modalIcon}>
              <ShoppingCart size={48} color={colors.primary} strokeWidth={2} />
            </View>

            <Text style={styles.modalTitle}>Coming Soon</Text>
            <Text style={styles.modalMessage}>
              Payment processing feature is coming soon! Stay tuned for updates.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowComingSoonModal(false)}
            >
              <Text style={styles.modalButtonText}>Got It</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  productsGrid: {
    marginBottom: spacing.lg,
  },
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.small,
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
  },
  productInfo: {
    padding: spacing.md,
  },
  productCategory: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  productName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  productDescription: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    ...typography.h3,
    color: colors.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyCartTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyCartText: {
    ...typography.body,
    color: colors.textMuted,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cartItemName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cartItemPrice: {
    ...typography.body,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    ...typography.body,
    color: colors.text,
    marginHorizontal: spacing.md,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: spacing.sm,
  },
  totalContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalLabel: {
    ...typography.body,
    color: colors.textLight,
  },
  totalValue: {
    ...typography.body,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  grandTotalLabel: {
    ...typography.h3,
    color: colors.text,
  },
  grandTotalValue: {
    ...typography.h3,
    color: colors.primary,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  checkoutButtonText: {
    ...typography.button,
    color: colors.surface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...shadows.large,
  },
  modalCloseButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.sm,
    zIndex: 1,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalMessage: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minWidth: 120,
    alignItems: 'center',
    ...shadows.medium,
  },
  modalButtonText: {
    ...typography.button,
    color: colors.surface,
  },
});
