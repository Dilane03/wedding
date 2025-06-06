"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, User, Mail, MapPin, Key, Heart, CheckCircle } from "lucide-react"
import Link from "next/link"
import { PageBackground } from "@/components/page-background"

interface GuestFormData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  guestType: "individual" | "couple" | "family"
  partnerName: string
  numberOfGuests: number
  password: string
  sendInvitation: boolean
}

export default function AddGuestPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<GuestFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    guestType: "individual",
    partnerName: "",
    numberOfGuests: 1,
    password: "",
    sendInvitation: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom complet est requis"
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'adresse email est requise"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Veuillez entrer une adresse email valide"
    }

    if (!formData.password.trim()) {
      newErrors.password = "Le mot de passe est requis"
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères"
    }

    if (formData.guestType === "couple" && !formData.partnerName.trim()) {
      newErrors.partnerName = "Le nom du partenaire est requis pour les couples"
    }

    if (formData.numberOfGuests < 1 || formData.numberOfGuests > 10) {
      newErrors.numberOfGuests = "Le nombre d'invités doit être entre 1 et 10"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generatePassword = () => {
    const words = ["amour", "joie", "celebration", "mariage", "toujours", "ensemble", "bonheur", "unite"]
    const numbers = Math.floor(Math.random() * 999) + 100
    const word = words[Math.floor(Math.random() * words.length)]
    return `${word}${numbers}`
  }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!validateForm()) {
    return
  }

  setIsSubmitting(true)

  try {
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData),
    })

    if (!res.ok) {
      const errorData = await res.json()
      setErrors({ general: errorData.error || "Erreur lors de l'ajout de l'invité." })
      setIsSubmitting(false)
      return
    }

    setIsSuccess(true)
    setIsSubmitting(false)

    setTimeout(() => {
      router.push("/admin")
    }, 2000)
  } catch (err) {
    console.error("Erreur API:", err)
    setErrors({ general: "Erreur de connexion au serveur." })
    setIsSubmitting(false)
  }
}


  const updateFormData = (field: keyof GuestFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (isSuccess) {
    return (
      <PageBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="wedding-card max-w-md w-full text-center shadow-xl">
            <CardContent className="pt-6">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-charcoal-800 mb-2">Invité ajouté avec succès !</h2>
                <p className="text-charcoal-600">
                  {formData.name} a été ajouté(e) à votre liste d'invités.
                  {formData.sendInvitation && " Une invitation sera envoyée sous peu."}
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/admin")}
                  className="w-full bg-primary hover:bg-primary/80 text-primary-foreground"
                >
                  Retour au Tableau de Bord
                </Button>
                <Button
                  onClick={() => {
                    setIsSuccess(false)
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      address: "",
                      city: "",
                      country: "",
                      guestType: "individual",
                      partnerName: "",
                      numberOfGuests: 1,
                      password: "",
                      sendInvitation: false,
                    })
                  }}
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary/10"
                >
                  Ajouter un Autre Invité
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageBackground>
    )
  }

  return (
    <PageBackground>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au Tableau de Bord
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-charcoal-800 wedding-title">Ajouter un Nouvel Invité</h1>
                <p className="text-charcoal-600">Ajoutez un invité à votre liste d'invitations de mariage</p>
              </div>
            </div>
            <Heart className="h-8 w-8 text-primary" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="wedding-card shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle className="text-charcoal-800">Informations de Base</CardTitle>
                </div>
                <CardDescription className="text-charcoal-600">Entrez les détails de base de l'invité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-charcoal-700">
                      Nom Complet *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      placeholder="Entrez le nom complet de l'invité"
                      className={`border-primary focus:border-primary ${errors.name ? "border-red-300" : ""}`}
                    />
                    {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guestType" className="text-charcoal-700">
                      Type d'Invité
                    </Label>
                    <Select value={formData.guestType} onValueChange={(value) => updateFormData("guestType", value)}>
                      <SelectTrigger className="border-primary focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="wedding-card">
                        <SelectItem value="individual">Individuel</SelectItem>
                        <SelectItem value="couple">Couple</SelectItem>
                        <SelectItem value="family">Famille</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.guestType === "couple" && (
                  <div className="space-y-2">
                    <Label htmlFor="partnerName" className="text-charcoal-700">
                      Nom du Partenaire *
                    </Label>
                    <Input
                      id="partnerName"
                      value={formData.partnerName}
                      onChange={(e) => updateFormData("partnerName", e.target.value)}
                      placeholder="Entrez le nom complet du partenaire"
                      className={`border-primary focus:border-primary ${errors.partnerName ? "border-red-300" : ""}`}
                    />
                    {errors.partnerName && <p className="text-red-600 text-sm">{errors.partnerName}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="numberOfGuests" className="text-charcoal-700">
                    Nombre d'Invités
                  </Label>
                  <Input
                    id="numberOfGuests"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.numberOfGuests}
                    onChange={(e) => updateFormData("numberOfGuests", Number.parseInt(e.target.value) || 1)}
                    className={`border-primary focus:border-primary ${errors.numberOfGuests ? "border-red-300" : ""}`}
                  />
                  {errors.numberOfGuests && <p className="text-red-600 text-sm">{errors.numberOfGuests}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="wedding-card shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle className="text-charcoal-800">Informations de Contact</CardTitle>
                </div>
                <CardDescription className="text-charcoal-600">
                  Comment pouvons-nous joindre cet invité ?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-charcoal-700">
                      Adresse Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      placeholder="invite@example.com"
                      className={`border-primary focus:border-primary ${errors.email ? "border-red-300" : ""}`}
                    />
                    {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-charcoal-700">
                      Numéro de Téléphone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      placeholder="01 23 45 67 89"
                      className="border-primary focus:border-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="wedding-card shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-charcoal-800">Informations d'Adresse</CardTitle>
                </div>
                <CardDescription className="text-charcoal-600">Adresse de l'invité (optionnel)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-charcoal-700">
                    Adresse
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData("address", e.target.value)}
                    placeholder="123 Rue de la Paix, Apt 4B"
                    rows={2}
                    className="border-primary focus:border-primary"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-charcoal-700">
                      Ville
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateFormData("city", e.target.value)}
                      placeholder="Paris"
                      className="border-primary focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-charcoal-700">
                      Pays
                    </Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => updateFormData("country", e.target.value)}
                      placeholder="France"
                      className="border-primary focus:border-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Login & Preferences */}
            <Card className="wedding-card shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Key className="h-5 w-5 text-primary" />
                  <CardTitle className="text-charcoal-800">Connexion et Préférences</CardTitle>
                </div>
                <CardDescription className="text-charcoal-600">
                  Configurez les identifiants de connexion et les préférences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-charcoal-700">
                    Mot de Passe de Connexion *
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="password"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      placeholder="Entrez le mot de passe de connexion"
                      className={`border-primary focus:border-primary ${errors.password ? "border-red-300" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateFormData("password", generatePassword())}
                      className="border-primary text-primary hover:bg-primary/10 whitespace-nowrap"
                    >
                      Générer
                    </Button>
                  </div>
                  {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendInvitation"
                    checked={formData.sendInvitation}
                    onCheckedChange={(checked) => updateFormData("sendInvitation", checked)}
                    className="border-primary"
                  />
                  <Label htmlFor="sendInvitation" className="text-charcoal-700 cursor-pointer">
                    Envoyer l'email d'invitation immédiatement après l'ajout de l'invité
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Link href="/admin">
                <Button
                  type="button"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/80 text-primary-foreground px-8">
                {isSubmitting ? "Ajout en cours..." : "Ajouter l'Invité"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageBackground>
  )
}
