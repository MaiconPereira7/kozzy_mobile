// src/screens/HomeScreen.tsx (REFATORADO - Parte 2/2 - Modal)

// Cole este código no mesmo arquivo do Part1, depois do componente SupportCard

interface TicketModalProps {
  visible: boolean;
  ticket: Ticket | null;
  userRole: string;
  editCategory: string;
  setEditCategory: (value: string) => void;
  editPriority: TicketPriority;
  setEditPriority: (value: TicketPriority) => void;
  onClose: () => void;
  onSave: () => void;
}

const TicketModal: React.FC<TicketModalProps> = ({
  visible,
  ticket,
  userRole,
  editCategory,
  setEditCategory,
  editPriority,
  setEditPriority,
  onClose,
  onSave,
}) => {
  if (!ticket) return null;

  const isSupervisor = userRole === 'supervisor';

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalhes do Chamado</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
              <Ionicons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Destaque */}
            <View style={styles.modalHighlight}>
              <Text style={styles.highlightName}>{ticket.name}</Text>
              <Text style={styles.highlightProtocol}>
                Protocolo: #{ticket.protocol}
              </Text>
            </View>

            {/* Data */}
            <DetailRow
              icon="calendar-outline"
              label="Data"
              value={`${ticket.date} às ${ticket.time}`}
            />

            {/* Prioridade */}
            <View style={styles.detailRowContainer}>
              <View style={styles.labelRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.detailLabel}> Prioridade</Text>
              </View>

              {isSupervisor ? (
                <View style={styles.prioritySelector}>
                  {(['high', 'medium', 'low'] as TicketPriority[]).map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setEditPriority(p)}
                      style={[
                        styles.priorityOption,
                        editPriority === p && {
                          backgroundColor:
                            p === 'high'
                              ? COLORS.priority.highBg
                              : p === 'medium'
                              ? COLORS.priority.mediumBg
                              : COLORS.priority.lowBg,
                          borderWidth: 1,
                          borderColor:
                            p === 'high'
                              ? COLORS.priority.high
                              : p === 'medium'
                              ? COLORS.priority.medium
                              : COLORS.priority.low,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          editPriority === p && {
                            fontWeight: 'bold',
                            color: COLORS.text.primary,
                          },
                        ]}
                      >
                        {p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.detailValueContainer}>
                  <Text style={styles.detailValue}>
                    {ticket.priority === 'high'
                      ? 'Alta'
                      : ticket.priority === 'medium'
                      ? 'Média'
                      : 'Baixa'}
                  </Text>
                </View>
              )}
            </View>

            {/* Departamento */}
            <View style={styles.detailRowContainer}>
              <View style={styles.labelRow}>
                <Ionicons
                  name="pricetag-outline"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.detailLabel}> Departamento</Text>
              </View>

              {isSupervisor ? (
                <TextInput
                  style={styles.inputEdit}
                  value={editCategory}
                  onChangeText={setEditCategory}
                  placeholder="Editar departamento"
                  placeholderTextColor={COLORS.input.placeholder}
                />
              ) : (
                <View style={styles.detailValueContainer}>
                  <Text style={styles.detailValue}>{ticket.category}</Text>
                </View>
              )}
            </View>

            {/* Descrição */}
            <View style={styles.detailRowContainer}>
              <View style={styles.labelRow}>
                <Ionicons
                  name="clipboard-outline"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.detailLabel}> Descrição</Text>
              </View>
              <View style={[styles.detailValueContainer, styles.textArea]}>
                <Text style={styles.detailValue}>{ticket.description}</Text>
              </View>
            </View>

            {/* Botões */}
            {isSupervisor && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: COLORS.info }]}
                onPress={onSave}
              >
                <Text style={styles.actionButtonText}>Salvar Alterações</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.actionButton,
                isSupervisor && {
                  backgroundColor: COLORS.border.medium,
                  marginTop: SPACING.md,
                },
              ]}
              onPress={onClose}
            >
              <Text style={styles.actionButtonText}>
                {isSupervisor ? 'Cancelar' : 'Fechar'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Componente auxiliar para linhas de detalhe
const DetailRow: React.FC<{
  icon: string;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <View style={styles.detailRowContainer}>
    <View style={styles.labelRow}>
      <Ionicons name={icon as any} size={18} color={COLORS.primary} />
      <Text style={styles.detailLabel}> {label}</Text>
    </View>
    <View style={styles.detailValueContainer}>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

// === STYLES ===

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.base,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  logoText: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.primary,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  subLogoText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  menuButton: {
    padding: SPACING.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.border.medium,
    marginRight: SPACING.sm,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: SPACING.md,
    color: COLORS.text.light,
    fontSize: TYPOGRAPHY.sizes.base,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.status.openBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  cardName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    maxWidth: 180,
  },
  cardSubject: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    maxWidth: 180,
  },
  timeText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.card.divider,
    marginVertical: SPACING.md,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    marginRight: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.round,
    borderTopRightRadius: BORDER_RADIUS.round,
    padding: SPACING.lg,
    height: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border.medium,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  closeIcon: {
    padding: SPACING.xs,
  },
  modalHighlight: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.card.divider,
  },
  highlightName: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.text.primary,
  },
  highlightProtocol: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.primary,
    marginTop: 2,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  detailRowContainer: {
    marginBottom: SPACING.base,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
  },
  detailValueContainer: {
    backgroundColor: COLORS.input.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  textArea: {
    minHeight: 80,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  inputEdit: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border.dark,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
  },
  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  priorityOption: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.card.divider,
  },
  priorityText: {
    color: COLORS.text.secondary,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.base,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xxxl,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.base,
  },
});

export default HomeScreen;
