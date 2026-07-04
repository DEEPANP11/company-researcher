"use client";

import type { ResearchResult } from "@/types";

export async function generateClientPdf(
  result: ResearchResult
): Promise<Blob> {
  const { pdf, Document, Page, Text, View, StyleSheet, Font } = await import(
    "@react-pdf/renderer"
  );

  Font.register({
    family: "Helvetica",
    fonts: [
      { src: "https://fonts.cdnfonts.com/s/29107/HelveticaNeue.woff", fontWeight: 400 },
    ],
  });

  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontFamily: "Helvetica",
      fontSize: 11,
    },
    header: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 6,
      color: "#2563eb",
    },
    subheader: {
      fontSize: 14,
      fontWeight: "bold",
      marginTop: 16,
      marginBottom: 8,
      paddingBottom: 4,
      borderBottom: "1px solid #e5e7eb",
      color: "#374151",
    },
    row: {
      flexDirection: "row",
      marginBottom: 4,
    },
    label: {
      width: 100,
      fontWeight: "bold",
      color: "#6b7280",
    },
    value: {
      flex: 1,
    },
    tag: {
      fontSize: 10,
      padding: "2px 8px",
      marginRight: 4,
      marginBottom: 4,
      backgroundColor: "#dbeafe",
      color: "#1d4ed8",
      borderRadius: 12,
    },
    painPoint: {
      fontSize: 10,
      padding: "4px 8px",
      marginBottom: 4,
      backgroundColor: "#fef2f2",
      borderLeft: "2px solid #ef4444",
    },
    competitorCard: {
      width: "48%",
      padding: 8,
      marginBottom: 8,
      border: "1px solid #bae6fd",
      backgroundColor: "#f0f9ff",
    },
    footer: {
      position: "absolute",
      bottom: 20,
      left: 40,
      right: 40,
      fontSize: 9,
      color: "#9ca3af",
      textAlign: "center",
      borderTop: "1px solid #e5e7eb",
      paddingTop: 8,
    },
    generatedDate: {
      fontSize: 10,
      color: "#9ca3af",
      marginBottom: 12,
    },
  });

  const Doc = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Company Research Report</Text>
        <Text style={styles.generatedDate}>
          Generated: {new Date(result.generatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>

        <Text style={styles.subheader}>Company Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{result.company.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Website</Text>
          <Text style={styles.value}>{result.company.website}</Text>
        </View>
        {result.company.phone && (
          <View style={styles.row}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{result.company.phone}</Text>
          </View>
        )}
        {result.company.address && (
          <View style={styles.row}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{result.company.address}</Text>
          </View>
        )}
        {result.company.industry && (
          <View style={styles.row}>
            <Text style={styles.label}>Industry</Text>
            <Text style={styles.value}>{result.company.industry}</Text>
          </View>
        )}
        {result.company.summary && (
          <>
            <Text style={styles.subheader}>Summary</Text>
            <Text style={{ fontSize: 10, lineHeight: 1.5 }}>
              {result.company.summary}
            </Text>
          </>
        )}

        {result.company.products.length > 0 && (
          <>
            <Text style={styles.subheader}>Products</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {result.company.products.map((p, i) => (
                <Text key={i} style={styles.tag}>
                  {p}
                </Text>
              ))}
            </View>
          </>
        )}

        {result.company.services.length > 0 && (
          <>
            <Text style={styles.subheader}>Services</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {result.company.services.map((s, i) => (
                <Text key={i} style={styles.tag}>
                  {s}
                </Text>
              ))}
            </View>
          </>
        )}

        {result.company.painPoints.length > 0 && (
          <>
            <Text style={styles.subheader}>AI-Generated Pain Points</Text>
            {result.company.painPoints.map((p, i) => (
              <Text key={i} style={styles.painPoint}>
                • {p}
              </Text>
            ))}
          </>
        )}

        {result.competitors.length > 0 && (
          <>
            <Text style={styles.subheader}>Competitors</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {result.competitors.map((c, i) => (
                <View key={i} style={styles.competitorCard}>
                  <Text style={{ fontWeight: "bold", fontSize: 11 }}>
                    {c.name}
                  </Text>
                  <Text style={{ fontSize: 9, color: "#2563eb" }}>
                    {c.website}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.footer}>
          Generated by Company Research Assistant | Data collected from public
          sources
        </Text>
      </Page>
    </Document>
  );

  const blob = await pdf(<Doc />).toBlob();
  return blob;
}
